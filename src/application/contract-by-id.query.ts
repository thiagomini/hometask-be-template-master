import { Op } from 'sequelize';

import { type ExpressHandler } from '../controllers/handler.type.js';
import { type HttpErrorResponse, notFound } from '../errors.js';
import { Contract } from '../model.js';

export type ContractByIdParams = {
  id: string;
};

export type ContractByIdResponse = Contract | HttpErrorResponse;

export const findContractById: ExpressHandler<
  unknown,
  ContractByIdResponse,
  unknown,
  ContractByIdParams
> = async (req, res) => {
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
};
