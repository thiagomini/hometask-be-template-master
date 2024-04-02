import bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

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
if (process.env.NODE_ENV !== 'test') {
  app.use(
    pinoHttp({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          colorizeObjects: true,
          messageFormat: '{req.method} {req.url}',
        },
      },
    }),
  );
}

registerContractRoutes(app);
registerJobsRoutes(app);
registerBalanceRoutes(app);
registerAdminRoutes(app);

app.get('/', (_req, res) => {
  res.send('Hello World!');
});


export default app;
