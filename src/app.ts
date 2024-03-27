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
app.get(
  '/contracts/:id',
  getProfile,
  validateParamId('Contract'),
  async (req, res) => {
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
  },
);

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

app.get('/jobs/unpaid', getProfile, async (req, res) => {
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
});

app.post('/jobs/:jobId/pay', getProfile, async (req, res) => {
  res.json({});
});

export default app;
