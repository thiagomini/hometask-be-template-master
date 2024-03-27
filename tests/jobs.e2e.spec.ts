/* eslint-disable @typescript-eslint/no-floating-promises */
import test, { before, describe } from 'node:test';

import { createDSL } from './dsl/dsl.factory.js';
import { initializeFactories } from './factories/init.js';
import { profileFactory } from './factories/profile.factory.js';
import app from '../src/app.js';

describe('Jobs E2E', () => {
  const dsl = createDSL(app);

  before(() => {
    initializeFactories();
  });

  describe('GET /jobs/unpaid', () => {
    test('Returns 401 when the user is not authenticated', async () => {
      await dsl.jobs.getUnpaidJobs().expect(401);
    });
    test('Returns an empty list when the user has no jobs', async () => {
      const aClient = await profileFactory.create();
      await dsl.jobs
        .getUnpaidJobs({
          profileId: aClient.id,
        })
        .expect(200, []);
    });
    test.todo(
      'Returns the list of unpaid active jobs belonging to the requesting client',
    );
  });

  describe('POST /jobs/:id/pay', () => {
    test.todo('Returns 401 when the user is not authenticated');
    test.todo('Returns 404 when the job does not exist');
    test.todo('Returns 404 when the job does not belong to the client');
    test.todo('Returns 400 when the job id is not a positive number');
    test.todo('Returns 400 when the job is already paid');
    test.todo('Returns 400 when the client does not have enough funds');
    test.todo('Returns 200 when the job is successfully paid');
  });
});
