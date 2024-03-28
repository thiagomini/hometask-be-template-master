import { Op } from 'sequelize';

import { type ExpressHandler } from '../controllers/handler.type.js';
import { type HttpErrorResponse } from '../errors.js';
import { Contract } from '../model.js';

export type ContractByIdResponse = Contract[] | HttpErrorResponse;

export const listContracts: ExpressHandler<
  unknown,
  ContractByIdResponse
> = async (req, res) => {
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
};
