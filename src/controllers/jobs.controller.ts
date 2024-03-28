import { type Express, type RequestHandler } from 'express';

import { payJob } from '../application/pay-job.command.js';
import { findUnpaidJobs } from '../application/unpaid-jobs.query.js';
import { getProfile } from '../middleware/getProfile.js';
import { validateParamId } from '../middleware/validators.js';

export function registerJobsRoutes(app: Express) {
  app.get(
    '/jobs/unpaid',
    getProfile as RequestHandler,
    findUnpaidJobs as RequestHandler,
  );

  app.post(
    '/jobs/:id/pay',
    getProfile as RequestHandler,
    validateParamId('Job'),
    payJob as unknown as RequestHandler,
  );
}
