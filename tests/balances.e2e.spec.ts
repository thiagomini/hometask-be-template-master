/* eslint-disable @typescript-eslint/no-floating-promises */
import test, { before, describe } from 'node:test';

import { createDSL } from './dsl/dsl.factory.js';
import { initializeFactories } from './factories/init.js';
import { contractorFactory } from './factories/profile.factory.js';
import app from '../src/app.js';

describe('Balances E2E', () => {
  const dsl = createDSL(app);

  before(() => {
    initializeFactories();
  });

  describe('POST /balances/deposit/:clientId', () => {
    test('Returns 400 when the client id is not a positive integer', async () => {
      await dsl.balances
        .deposit({
          amount: 100,
          userId: 0,
        })
        .expect(400);
    });
    test('Returns 404 when the client id does not exist in the database', async () => {
      await dsl.balances
        .deposit({
          amount: 100,
          userId: 999_999,
        })
        .expect(404, {
          detail: 'Client with id 999999 not found',
          title: 'Entity not found',
          status: 404,
        });
    });
    test('Returns 400 when the user is a contractor', async () => {
      const aContractor = await contractorFactory.create();
      await dsl.balances
        .deposit({
          amount: 100,
          userId: aContractor.id,
        })
        .expect(400, {
          detail: 'Only clients can deposit funds',
          title: 'Bad Request',
          status: 400,
        });
    });
    test.todo(
      'Returns 409 when the deposit amount surpasses more than 25% of the client total of jobs to pay',
    );
    test.todo('Returns the updated balance of the client with the given id');
  });
});
