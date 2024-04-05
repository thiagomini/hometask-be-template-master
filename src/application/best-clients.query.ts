import { QueryTypes, type Sequelize } from 'sequelize';
import { z } from 'zod';

import { type ExpressHandler } from '../controllers/handler.type.js';
import { type HttpErrorResponse, badRequest } from '../errors.js';

export type PayingClient = {
  id: number;
  fullName: string;
  totalPaid: number;
};

export type FindBestClientsResponse = PayingClient[] | HttpErrorResponse;

export type FindBestClientsQuery = {
  start: string;
  end: string;
  limit: number;
};

export const findBestClients: ExpressHandler<
  unknown,
  FindBestClientsResponse,
  FindBestClientsQuery
> = async (req, res) => {
  // Schema definition could be extracted. Moreover, it could also be passed as a parameter.
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

  const result = schema.safeParse({
    start: req.query.start && new Date(req.query.start),
    end: req.query.end && new Date(req.query.end),
    limit: Number(req.query.limit),
  });

  if (!result.success) {
    return res.status(400).json(
      badRequest({
        detail: 'Your request data is invalid',
        errors: result.error.errors,
      }),
    );
  }

  const sequelize: Sequelize = req.app.get('sequelize');

  const clientsThatPaidTheMostWithinPeriod =
    await sequelize.query<PayingClient>(
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
        replacements: [
          result.data.start,
          result.data.end,
          result.data.limit ?? 2,
        ],
        type: QueryTypes.SELECT,
      },
    );

  res.json(clientsThatPaidTheMostWithinPeriod);
};
