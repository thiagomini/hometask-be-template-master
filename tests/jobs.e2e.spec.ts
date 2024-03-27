/* eslint-disable @typescript-eslint/no-floating-promises */
import test, { before, describe } from 'node:test';

import { createDSL } from './dsl/dsl.factory.js';
import { contractFactory } from './factories/contract.factory.js';
import { initializeFactories } from './factories/init.js';
import {
  paidJobFactory,
  unpaidJobFactory
} from './factories/jobs.factory.js';
import {
  clientFactory,
  contractorFactory,
  profileFactory,
} from './factories/profile.factory.js';
import app from '../src/app.js';

describe('Jobs E2E', () => {
  const dsl = createDSL(app);

  before(() => {
    initializeFactories();
  });

  describe('GET /jobs/unpaid', () => {
    test('Returns 401 when the user is not authenticated', async () => {
      await dsl.jobs.listUnpaidJobs().expect(401);
    });
    test('Returns an empty list when the user has no jobs', async () => {
      const aClient = await profileFactory.create();
      await dsl.jobs
        .listUnpaidJobs({
          profileId: aClient.id,
        })
        .expect(200, []);
    });
    test('Returns an empty list when the user has no UNPAID jobs', async () => {
      // Arrange
      const aClient = await clientFactory.create();
      const aContract = await contractFactory.create({
        clientId: aClient.id,
      });
      await paidJobFactory.create({
        contractId: aContract.id,
      });

      // Act
      await dsl.jobs
        .listUnpaidJobs({
          profileId: aClient.id,
        })
        .expect(200, []);
    });
    test('Returns an empty list when the user has no active jobs', async () => {
      // Arrange
      const aClient = await clientFactory.create();
      const [_newContract, terminatedContract] =
        await contractFactory.createMany(2, [
          { clientId: aClient.id, status: 'new' },
          { clientId: aClient.id, status: 'terminated' },
        ]);
      await unpaidJobFactory.create({
        contractId: terminatedContract.id,
      });

      // Act
      await dsl.jobs
        .listUnpaidJobs({
          profileId: aClient.id,
        })
        .expect(200, []);
    });
    test('Returns the list of unpaid active jobs belonging to the requesting client', async () => {
      const aClient = await clientFactory.create();
      const aContract = await contractFactory.create({
        clientId: aClient.id,
        status: 'in_progress',
      });
      const [_paidJob, unpaidJob] = await Promise.all([
        paidJobFactory.create({
          contractId: aContract.id,
        }),
        unpaidJobFactory.create({
          contractId: aContract.id,
        }),
      ]);

      await dsl.jobs
        .listUnpaidJobs({
          profileId: aClient.id,
        })
        .expect(200, [
          {
            id: unpaidJob.id,
            description: unpaidJob.description,
            price: unpaidJob.price,
            paid: false,
            paymentDate: null,
            createdAt: unpaidJob.createdAt.toISOString(),
            updatedAt: unpaidJob.updatedAt.toISOString(),
            contractId: unpaidJob.contractId,
          },
        ]);
    });
    test('Returns the list of unpaid active jobs belonging to the requesting contractor', async () => {
      // Arrange
      const aContractor = await contractorFactory.create();
      const aContract = await contractFactory.create({
        contractorId: aContractor.id,
        status: 'in_progress',
      });
      const [_paidJob, unpaidJob] = await Promise.all([
        paidJobFactory.create({
          contractId: aContract.id,
        }),
        unpaidJobFactory.create({
          contractId: aContract.id,
        }),
      ]);

      // Act
      await dsl.jobs
        .listUnpaidJobs({
          profileId: aContractor.id,
        })
        .expect(200, [
          {
            id: unpaidJob.id,
            description: unpaidJob.description,
            price: unpaidJob.price,
            paid: unpaidJob.paid,
            paymentDate: null,
            createdAt: unpaidJob.createdAt.toISOString(),
            updatedAt: unpaidJob.updatedAt.toISOString(),
            contractId: unpaidJob.contractId,
          },
        ]);
    });
  });

  describe('POST /jobs/:id/pay', () => {
    test('Returns 401 when the user is not authenticated', async () => {
      await dsl.jobs.payJob(1).expect(401);
    });
    test.todo('Returns 404 when the job does not exist');
    test.todo('Returns 404 when the job does not belong to the client');
    test.todo('Returns 400 when the job id is not a positive number');
    test.todo('Returns 400 when the job is already paid');
    test.todo('Returns 400 when the client does not have enough funds');
    test.todo('Returns 200 when the job is successfully paid');
  });
});
