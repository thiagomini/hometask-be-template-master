import bodyParser from 'body-parser';
import express from 'express';
import { Op } from 'sequelize';

import { httpError, notFound } from './errors.js';
import { getProfile } from './middleware/getProfile.js';
import { validateParamId } from './middleware/validators.js';
import { sequelize } from './model.js';
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, validateParamId, async (req, res) => {
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
  res.json(contract);
});

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

export default app;
