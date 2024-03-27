import { type Express } from 'express';
import request from 'supertest';

import { type RequestOptions } from './request.options.js';

export type JobsOptions = RequestOptions;

export function jobs(app: Express) {
  return Object.freeze({
    getUnpaidJobs(options: JobsOptions = {}) {
      return request(app)
        .get('/jobs/unpaid')
        .set('profile_id', String(options?.profileId?.toString() ?? ''));
    },
  });
}
