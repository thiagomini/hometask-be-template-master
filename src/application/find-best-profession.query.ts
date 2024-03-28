import { Op, type Sequelize } from 'sequelize';
import { type ZodError, z } from 'zod';

import { type ExpressHandler } from '../controllers/handler.type.js';
import { badRequest } from '../errors.js';

export type FindBestProfessionResponse =
  | { profession: string }
  | { detail?: string; errors?: unknown[]; title?: string };

export type FindBestProfessionQuery = {
  start: string;
  end: string;
};

export const findBestProfession: ExpressHandler<
  never,
  FindBestProfessionResponse,
  FindBestProfessionQuery
> = async (req, res) => {
  const schema = z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .refine((data) => data.start < data.end, {
      message: 'End date must be greater than start date',
      path: ['start'],
    });

  const result = schema.safeParse({
    start: req.query.start && new Date(req.query.start),
    end: req.query.end && new Date(req.query.end),
  });
  // Zod only understands the "result" value has the "error" property when we check for strict equality with false
  if (result.success === false) {
    const error: ZodError = result.error;
    return res.status(400).json(
      badRequest({
        detail: 'Your request data is invalid',
        errors: error.errors,
      }),
    );
  }

  const { Contract, Job, Profile } = req.app.get('models');
  const { start, end } = result.data;
  const sequelize: Sequelize = req.app.get('sequelize');

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
};
