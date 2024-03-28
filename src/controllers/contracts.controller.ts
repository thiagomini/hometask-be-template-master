import { type Express, type RequestHandler } from 'express';
import { Op } from 'sequelize';

import { notFound } from '../errors.js';
import { getProfile } from '../middleware/getProfile.js';
import { validateParamId } from '../middleware/validators.js';

export function registerContractRoutes(app: Express) {
  app.get(
    '/contracts/:id',
    getProfile as RequestHandler,
    validateParamId('Contract'),
    (async (req, res) => {
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
    }) as RequestHandler,
  );

  app.get(
    '/contracts',
    getProfile as RequestHandler,
    (async (req, res) => {
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
    }) as RequestHandler,
  ) as RequestHandler;
}
