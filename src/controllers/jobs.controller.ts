import { type Express, type RequestHandler } from 'express';
import { Op, type Transaction } from 'sequelize';

import { conflict, httpError, notFound } from '../errors.js';
import { getProfile } from '../middleware/getProfile.js';
import { validateParamId } from '../middleware/validators.js';

export function registerJobsRoutes(app: Express) {
  app.get(
    '/jobs/unpaid',
    getProfile as RequestHandler,
    (async (req, res) => {
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
    }) as RequestHandler,
  );

  app.post(
    '/jobs/:id/pay',
    getProfile as RequestHandler,
    validateParamId('Job'),
    (async (req, res) => {
      const { Job, Contract } = req.app.get('models');
      const { id: jobId } = req.params;

      const profile = req.profile;

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

      const sequelize = req.app.get('sequelize');
      await sequelize.transaction(async (t: Transaction) => {
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
    }) as RequestHandler,
  );
}
