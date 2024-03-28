/* eslint-disable @typescript-eslint/no-floating-promises */
import test, { before, describe } from 'node:test';

import { createDSL } from './dsl/dsl.factory.js';
import { contractFactory } from './factories/contract.factory.js';
import { initializeFactories } from './factories/init.js';
import { paidJobFactory } from './factories/jobs.factory.js';
import {
  clientFactory,
  contractorFactory,
} from './factories/profile.factory.js';
import app from '../src/app.js';

describe('Admin E2E', { timeout: 1000 }, () => {
  const dsl = createDSL(app);

  before(() => {
    initializeFactories();
  });

  describe('GET /admin/best-profession?start=<date>&end=<date>', () => {
    test('Returns 400 when query parameters are invalid', async () => {
      await dsl.admin
        .bestProfession({
          start: 'not-a-date',
          end: 'not-a-date',
        })
        .expect(400, {
          title: 'Bad Request',
          detail: 'Your request data is invalid',
          status: 400,
          errors: [
            {
              code: 'invalid_date',
              path: ['start'],
              message: 'Invalid date',
            },
            {
              code: 'invalid_date',
              path: ['end'],
              message: 'Invalid date',
            },
          ],
        });
    });
    test('Returns 400 when the start date is greater than the end date', async () => {
      await dsl.admin
        .bestProfession({
          start: '2021-01-01',
          end: '2020-01-01',
        })
        .expect(400, {
          title: 'Bad Request',
          detail: 'Your request data is invalid',
          status: 400,
          errors: [
            {
              code: 'custom',
              message: 'End date must be greater than start date',
              path: ['start'],
            },
          ],
        });
    });
    test('Returns the profession that earned the most money within the given date range', async () => {
      // Arrange
      const [developer, designer, manager] = await contractorFactory.createMany(
        3,
        [
          { profession: 'developer' },
          { profession: 'designer' },
          { profession: 'manager' },
        ],
      );
      const aClient = await clientFactory.create();

      const [devContract, designerContract, managerContract] =
        await contractFactory.createMany(3, [
          {
            clientId: aClient.id,
            contractorId: developer.id,
            status: 'in_progress',
          },
          {
            clientId: aClient.id,
            contractorId: designer.id,
            status: 'in_progress',
          },
          {
            clientId: aClient.id,
            contractorId: manager.id,
            status: 'in_progress',
          },
        ]);

      const [startDate, endDate] = ['2025-01-01', '2025-12-31'];

      await paidJobFactory.createMany(6, [
        {
          price: 100,
          contractId: devContract.id,
          paymentDate: new Date('2025-01-01'),
        },
        {
          price: 200,
          contractId: devContract.id,
          paymentDate: new Date('2025-02-01'),
        },
        {
          price: 200,
          contractId: designerContract.id,
          paymentDate: new Date('2025-06-01'), // designer earned the most within the date range
        },
        {
          price: 250,
          contractId: designerContract.id,
          paymentDate: new Date('2025-07-01'),
        },
        {
          price: 200,
          contractId: managerContract.id,
          paymentDate: new Date('2025-12-01'),
        },
        {
          price: 300,
          contractId: managerContract.id,
          paymentDate: new Date('2026-01-01'), // manager earned the most, but it's out of the date ranges
        },
      ]);

      // Act
      await dsl.admin
        .bestProfession({
          start: startDate,
          end: endDate,
        })
        .expect(200, {
          profession: 'designer',
        });
    });
  });

  describe('GET /admin/best-clients?start=<date>&end=<date>&limit=<integer>', () => {
    test('Returns 400 when the query parameters are invalid', async () => {
      await dsl.admin
        .bestClients({
          start: 'not-a-date',
          end: 'not-a-date',
          limit: -1,
        })
        .expect(400, {
          title: 'Bad Request',
          detail: 'Your request data is invalid',
          status: 400,
          errors: [
            {
              code: 'invalid_date',
              path: ['start'],
              message: 'Invalid date',
            },
            {
              code: 'invalid_date',
              path: ['end'],
              message: 'Invalid date',
            },
            {
              code: 'too_small',
              minimum: 0,
              type: 'number',
              inclusive: false,
              exact: false,
              message: 'Number must be greater than 0',
              path: ['limit'],
            },
          ],
        });
    });
    test('Returns 400 when the start date is greater than the end date', async () => {
      await dsl.admin
        .bestClients({
          start: '2021-01-01',
          end: '2020-01-01',
          limit: 1,
        })
        .expect(400, {
          title: 'Bad Request',
          detail: 'Your request data is invalid',
          status: 400,
          errors: [
            {
              code: 'custom',
              message: 'End date must be greater than start date',
              path: ['start'],
            },
          ],
        });
    });
    test('Returns the clients that paid the most within the given date range', async () => {
      // Arrange
      const [client1, client2, client3] = await clientFactory.createMany(3);
      const [contract1, contract2, contract3] =
        await contractFactory.createMany(3, [
          { clientId: client1.id },
          { clientId: client2.id },
          { clientId: client3.id },
        ]);

      const [startDate, endDate] = ['2030-01-02', '2030-01-03'];

      await paidJobFactory.createMany(6, [
        {
          price: 100,
          contractId: contract1.id,
          paymentDate: new Date('2030-01-02'),
        },
        {
          price: 200,
          contractId: contract1.id,
          paymentDate: new Date('2030-01-02'),
        },
        {
          price: 200,
          contractId: contract2.id,
          paymentDate: new Date('2030-01-02'),
        },
        {
          price: 250,
          contractId: contract2.id,
          paymentDate: new Date('2030-01-02'), // client2 paid the most within the date range
        },
        {
          price: 200,
          contractId: contract3.id,
          paymentDate: new Date('2030-01-02'),
        },
        {
          price: 300,
          contractId: contract3.id,
          paymentDate: new Date('2030-01-03'), // client3 paid the most, but it's out of the date ranges
        },
      ]);

      // Act
      await dsl.admin
        .bestClients({
          start: startDate,
          end: endDate,
          limit: 2,
        })
        .expect(200, [
          {
            id: client2.id,
            fullName: client2.fullName,
            totalPaid: 450,
          },
          {
            id: client1.id,
            fullName: client1.fullName,
            totalPaid: 300,
          },
        ]);
    });
  });
});
