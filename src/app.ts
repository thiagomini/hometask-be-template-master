import bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';
import { Op, QueryTypes } from 'sequelize';
import { z } from 'zod';

import { registerBalanceRoutes } from './controllers/balance.controller.js';
import { registerContractRoutes } from './controllers/contracts.controller.js';
import { registerJobsRoutes } from './controllers/jobs.controller.js';
import { badRequest } from './errors.js';
import { sequelize } from './model.js';
const app = express();
app.use(bodyParser.json());
app.use(helmet());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

registerContractRoutes(app);
registerJobsRoutes(app);
registerBalanceRoutes(app);


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
