import bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';

import { registerAdminRoutes } from './controllers/admin.controller.js';
import { registerBalanceRoutes } from './controllers/balance.controller.js';
import { registerContractRoutes } from './controllers/contracts.controller.js';
import { registerJobsRoutes } from './controllers/jobs.controller.js';
import { sequelize } from './model.js';
const app = express();
app.use(bodyParser.json());
app.use(helmet());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

registerContractRoutes(app);
registerJobsRoutes(app);
registerBalanceRoutes(app);
registerAdminRoutes(app);


export default app;
