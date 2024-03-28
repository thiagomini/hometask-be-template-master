import { type Express, type RequestHandler } from 'express';
import { QueryTypes } from 'sequelize';
import { z } from 'zod';

import { findBestProfession } from '../application/find-best-profession.query.js';
import { badRequest } from '../errors.js';

export function registerAdminRoutes(app: Express) {
  app.get('/admin/best-profession', findBestProfession as RequestHandler);

  app.get('/admin/best-clients', (async (req, res) => {
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
      start: new Date(req.query.start),
      end: new Date(req.query.end),
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
        replacements: [
          result.data.start,
          result.data.end,
          result.data.limit ?? 2,
        ],
        type: QueryTypes.SELECT,
      },
    );

    res.json(clientsThatPaidTheMostWithinPeriod);
  }) as RequestHandler);
}
