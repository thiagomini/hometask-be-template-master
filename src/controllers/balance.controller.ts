import { type Express, type RequestHandler } from 'express';

import { depositCommand } from '../application/deposit.command.js';
import { validateParamId } from '../middleware/validators.js';
export function registerBalanceRoutes(app: Express) {
  app.post(
    '/balances/deposit/:id',
    validateParamId('Client'),
    depositCommand as RequestHandler,
  );
}
