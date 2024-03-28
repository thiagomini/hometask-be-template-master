/* eslint-disable @typescript-eslint/no-floating-promises */
import test, { describe } from 'node:test';

import { createDSL } from './dsl/dsl.factory.js';
import { contractFactory } from './factories/contract.factory.js';
import { paidJobFactory } from './factories/jobs.factory.js';
import {
  clientFactory,
  contractorFactory,
} from './factories/profile.factory.js';
import app from '../src/app.js';

describe('Admin E2E', { timeout: 1000 }, () => {
  const dsl = createDSL(app);

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

      const [startDate, endDate] = ['2023-01-01', '2023-12-31'];

      await paidJobFactory.createMany(6, [
        {
          price: 100,
          contractId: devContract.id,
          paymentDate: new Date('2023-01-01'),
        },
        {
          price: 200,
          contractId: devContract.id,
          paymentDate: new Date('2023-02-01'),
        },
        {
          price: 200,
          contractId: designerContract.id,
          paymentDate: new Date('2023-06-01'), // designer earned the most within the date range
        },
        {
          price: 250,
          contractId: designerContract.id,
          paymentDate: new Date('2023-07-01'),
        },
        {
          price: 200,
          contractId: managerContract.id,
          paymentDate: new Date('2023-12-01'),
        },
        {
          price: 300,
          contractId: managerContract.id,
          paymentDate: new Date('2024-01-01'), // manager earned the most, but it's out of the date ranges
        },
      ]);

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
    test.todo('Returns 400 when the start date is not a valid date');
    test.todo('Returns 400 when the end date is not a valid date');
    test.todo('Returns 400 when the start date is greater than the end date');
    test.todo('Returns 400 when the limit is not a positive integer');
    test.todo(
      'Returns the clients that paid the most within the given date range',
    );
  });
});
