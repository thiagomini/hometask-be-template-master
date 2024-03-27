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
    test('Returns 404 when the job does not exist', async () => {
      // Arrange
      const aClient = await clientFactory.create();

      // Act
      await dsl.jobs
        .payJob(999999, {
          profileId: aClient.id,
        })
        .expect(404, {
          detail: 'Job with id 999999 not found for requesting user',
          title: 'Entity not found',
          status: 404,
        });
    });
    test('Returns 404 when the job does not belong to the client', async () => {
      // Arrange
      const [aClient, anotherClient] = await clientFactory.createMany(2);
      const aContract = await contractFactory.create({
        clientId: anotherClient.id,
      });
      const aJob = await unpaidJobFactory.create({
        contractId: aContract.id,
      });

      // Act
      await dsl.jobs
        .payJob(aJob.id, {
          profileId: aClient.id,
        })
        .expect(404, {
          detail: `Job with id ${aJob.id} not found for requesting user`,
          title: 'Entity not found',
          status: 404,
        });
    });
    test('Returns 400 when the job id is not a positive number', async () => {
      // Arrange
      const aClient = await clientFactory.create();

      // Act
      await dsl.jobs
        .payJob(0, {
          profileId: aClient.id,
        })
        .expect(400, {
          detail: 'Job id must be a positive integer',
          title: 'Bad Request',
          status: 400,
        });
    });
    test('Returns 409 when the job is already paid', async () => {
      // Arrange
      const aClient = await clientFactory.create();
      const aContract = await contractFactory.create({
        clientId: aClient.id,
      });
      const aJob = await paidJobFactory.create({
        contractId: aContract.id,
      });

      // Act
      await dsl.jobs
        .payJob(aJob.id, {
          profileId: aClient.id,
        })
        .expect(409, {
          detail: `Job with id ${aJob.id} is already paid`,
          title: 'Conflict',
          status: 409,
        });
    });
    test('Returns 400 when the client does not have enough funds', async () => {
      // Arrange
      const aClient = await clientFactory.create({
        balance: 10,
      });
      const aContract = await contractFactory.create({
        clientId: aClient.id,
        status: 'in_progress',
      });
      const aJob = await unpaidJobFactory.create({
        contractId: aContract.id,
        price: 11,
      });

      // Act
      await dsl.jobs
        .payJob(aJob.id, {
          profileId: aClient.id,
        })
        .expect(400, {
          detail: 'Insufficient funds',
          title: 'Bad Request',
          status: 400,
        });
    });
    test.todo('Returns 200 when the job is successfully paid');
  });
});
