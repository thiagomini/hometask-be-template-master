import test, { describe } from 'node:test';

import { createDSL } from './dsl/dsl.factory';
import app from '../src/app';

describe('Admin E2E', () => {
  const dsl = createDSL(app);

  describe('GET /admin/best-profession?start=<date>&end=<date>', () => {
    test.todo('Returns 400 when the start date is not a valid date');
    test.todo('Returns 400 when the end date is not a valid date');
    test.todo('Returns 400 when the start date is greater than the end date');
    test.todo(
      'Returns the profession that earned the most money within the given date range',
    );
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
