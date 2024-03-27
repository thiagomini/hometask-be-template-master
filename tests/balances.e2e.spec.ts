/* eslint-disable @typescript-eslint/no-floating-promises */
import test, { describe } from 'node:test';

describe('Balances E2E', () => {
  describe('POST /balances/deposit/:clientId', () => {
    test.todo('Returns 400 when the client id is not a positive integer');
    test.todo('Returns 404 when the client id does not exist in the database');
    test.todo('Returns 400 when the user is a contractor');
    test.todo(
      'Returns 409 when the deposit amount surpasses more than 25% of the client total of jobs to pay',
    );
    test.todo('Returns the updated balance of the client with the given id');
  });
});
