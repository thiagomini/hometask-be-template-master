import bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';
import { Op, QueryTypes } from 'sequelize';
import { z } from 'zod';

import { badRequest, conflict, httpError, notFound } from './errors.js';
import { getProfile } from './middleware/getProfile.js';
import { validateParamId } from './middleware/validators.js';
import { sequelize } from './model.js';
const app = express();
app.use(bodyParser.json());
app.use(helmet());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

/**
 * FIX ME!
 * @returns contract by id
 */
app.get(
  '/contracts/:id',
  getProfile,
  validateParamId('Contract'),
  async (req, res) => {
    const { Contract } = req.app.get('models');
    const { id } = req.params;
    const contract = await Contract.findOne({
      where: {
        id,
        [Op.or]: {
          clientId: req.profile.id,
          contractorId: req.profile.id,
        },
      },
    });
    if (!contract)
      return res
        .status(404)
        .json(
          notFound({
            detail: `Contract with id ${id} not found for requesting user`,
          }),
        )
        .end();
    return res.json(contract);
  },
);

app.get('/contracts', getProfile, async (req, res) => {
  const { Contract } = req.app.get('models');
  const contracts = await Contract.findAll({
    where: {
      [Op.or]: {
        clientId: req.profile.id,
        contractorId: req.profile.id,
      },
      status: {
        [Op.ne]: 'terminated',
      },
    },
  });
  res.json(contracts);
});

app.get('/jobs/unpaid', getProfile, async (req, res) => {
  const { Job, Contract } = req.app.get('models');
  const jobs = await Job.findAll({
    where: {
      paid: false,
      '$Contract.status$': 'in_progress',
      [Op.or]: {
        '$Contract.clientId$': req.profile.id,
        '$Contract.contractorId$': req.profile.id,
      },
    },
    include: {
      model: Contract,
      as: 'Contract',
      attributes: [],
    },
  });
  return res.json(jobs);
});

app.post(
  '/jobs/:id/pay',
  getProfile,
  validateParamId('Job'),
  async (req, res) => {
    const { Job, Contract } = req.app.get('models');
    const { id: jobId } = req.params;

    const profile: Profile = req.profile;

    const job = await Job.findOne({
      where: {
        id: jobId,
        '$Contract.clientId$': profile.id,
      },
      include: {
        model: Contract,
        as: 'Contract',
        attributes: [],
      },
    });

    if (!job)
      return res
        .status(404)
        .json(
          notFound({
            detail: `Job with id ${jobId} not found for requesting user`,
          }),
        )
        .end();

    if (job.paid) {
      return res.status(409).json(
        conflict({
          detail: `Job with id ${jobId} is already paid`,
        }),
      );
    }

    if (profile.balance < job.price) {
      return res.status(400).json(
        httpError({
          status: 400,
          title: 'Bad Request',
          detail: 'Insufficient funds',
        }),
      );
    }

    const newBalance = profile.balance - job.price;

    await sequelize.transaction(async (t) => {
      await profile.update(
        {
          balance: newBalance,
        },
        {
          transaction: t,
        },
      );

      await job.update(
        {
          paid: true,
          paymentDate: new Date(),
        },
        {
          transaction: t,
        },
      );
    });

    return res.status(200).json({
      newBalance,
    });
  },
);

app.post(
  '/balances/deposit/:id',
  validateParamId('Client'),
  async (req, res) => {
    const { Profile, Job, Contract } = req.app.get('models');
    const { id } = req.params;

    const user = await Profile.findByPk(id);

    if (!user)
      return res.status(404).json(
        notFound({
          detail: `Client with id ${id} not found`,
        }),
      );

    if (user.type !== 'client') {
      return res.status(400).json(
        httpError({
          status: 400,
          title: 'Bad Request',
          detail: 'Only clients can deposit funds',
        }),
      );
    }

    const totalAmountToPay = await Job.sum('price', {
      where: {
        paid: false,
        '$Contract.clientId$': user.id,
        '$Contract.status$': 'in_progress',
      },
      include: {
        model: Contract,
        as: 'Contract',
      },
    });

    const depositAmount = req.body.amount;

    if (depositAmount > totalAmountToPay * 1.25) {
      return res.status(409).json(
        conflict({
          detail:
            'Deposit amount exceeds more than 25% of the client total of jobs to pay',
        }),
      );
    }

    const newBalance = user.balance + depositAmount;

    await user.update({
      balance: newBalance,
    });

    return res.status(200).json({
      newBalance,
    });
  },
);

app.get('/admin/best-profession', async (req, res) => {
  const schema = z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .refine((data) => data.start < data.end, {
      message: 'End date must be greater than start date',
      path: ['start'],
    });

  const { data, error } = schema.safeParse({
    start: new Date(req.query.start),
    end: new Date(req.query.end),
  });
  if (error) {
    return res.status(400).json(
      badRequest({
        detail: 'Your request data is invalid',
        errors: error.errors,
      }),
    );
  }

  const { Contract, Job, Profile } = req.app.get('models');
  const { start, end } = data;

  const [jobThatEarnedTheMost] = await Job.findAll({
    where: {
      paymentDate: {
        [Op.between]: [start, end],
      },
      paid: true,
    },
    attributes: [[sequelize.fn('sum', sequelize.col('price')), 'total']],
    include: [
      {
        model: Contract,
        required: true,
        include: {
          model: Profile,
          as: 'contractor',
          required: true,
        },
      },
    ],
    group: [sequelize.col('Contract.contractor.profession')],
    order: [[sequelize.literal('total'), 'DESC']],
    limit: 1,
  });

  res.status(200).json({
    profession: jobThatEarnedTheMost.Contract.contractor.profession,
  });
});

app.get('/admin/best-clients', async (req, res) => {
  const schema = z
    .object({
      start: z.date(),
      end: z.date(),
      limit: z.number().int().positive(),
    })
    .refine((data) => data.start < data.end, {
      message: 'End date must be greater than start date',
      path: ['start'],
    });

  const { data, error } = schema.safeParse({
    start: new Date(req.query.start),
    end: new Date(req.query.end),
    limit: Number(req.query.limit),
  });

  if (error) {
    return res.status(400).json(
      badRequest({
        detail: 'Your request data is invalid',
        errors: error.errors,
      }),
    );
  }

  const sequelize = req.app.get('sequelize');

  const clientsThatPaidTheMostWithinPeriod = await sequelize.query(
    `
    SELECT "Profiles"."id", "Profiles"."firstName" || ' ' || "Profiles"."lastName" as "fullName", SUM("price") AS "totalPaid"
    FROM "Profiles"
    INNER JOIN "Contracts" ON "Profiles"."id" = "Contracts"."clientId"
    INNER JOIN "Jobs" ON "Contracts"."id" = "Jobs"."contractId"
    WHERE "Profiles"."type" = 'client'
    AND "Jobs"."paid" = true
    AND "Jobs"."paymentDate" BETWEEN ? AND ?
    GROUP BY "Profiles"."id"
    ORDER BY "totalPaid" DESC
    LIMIT ?
  `,
    {
      replacements: [data.start, data.end, data.limit ?? 2],
      type: QueryTypes.SELECT,
    },
  );

  res.json(clientsThatPaidTheMostWithinPeriod);
});

export default app;
