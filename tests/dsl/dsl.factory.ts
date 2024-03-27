import { type Express } from 'express';

import { contracts } from './contracts.dsl.js';
import { jobs } from './jobs.dsl.js';

/**
 * DSL factory creates an object useful to encapsulate details of the API. If an endpoint changes the
 * underlying DSL can be updated without changing the tests.
 */
export function createDSL(app: Express) {
  // Freezing the object to prevent accidental changes
  return Object.freeze({
    contracts: contracts(app),
    jobs: jobs(app),
  });
}
