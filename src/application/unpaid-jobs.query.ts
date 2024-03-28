import { Op } from 'sequelize';

import { type ExpressHandler } from '../controllers/handler.type.js';
import { Contract, Job } from '../model.js';

export type UnpaidJobsQueryResponse = Job[];

export const findUnpaidJobs: ExpressHandler<
  unknown,
  UnpaidJobsQueryResponse
> = async (req, res) => {
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
};
