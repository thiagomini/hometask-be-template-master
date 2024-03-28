import { type Express, type RequestHandler } from 'express';

import { findContractById } from '../application/contract-by-id.query.js';
import { listContracts } from '../application/contracts.query.js';
import { getProfile } from '../middleware/getProfile.js';
import { validateParamId } from '../middleware/validators.js';

export function registerContractRoutes(app: Express) {
  app.get(
    '/contracts/:id',
    getProfile as RequestHandler,
    validateParamId('Contract'),
    findContractById as RequestHandler,
  );

  app.get(
    '/contracts',
    getProfile as RequestHandler,
    listContracts as RequestHandler,
  ) as RequestHandler;
}
