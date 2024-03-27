import model from './model.js';
import express from 'express';
import bodyParser from 'body-parser';
import { getProfile } from './middleware/getProfile.js';
const app = express();
app.use(bodyParser.json());
app.set('sequelize', model.sequelize);
app.set('models', model.sequelize.models);

/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (req, res) => {
  const { Contract } = req.app.get('models');
  const { id } = req.params;
  const contract = await Contract.findOne({ where: { id } });
  if (!contract) return res.status(404).end();
  res.json(contract);
});
export default app;
