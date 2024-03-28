/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from 'node:assert/strict';
import test, { describe } from 'node:test';

import { createDSL } from './dsl/dsl.factory.js';
import app from '../src/app.js';

describe('Middlewares E2E', { timeout: 1000 }, () => {
  const dsl = createDSL(app);

  test('Should remove x-powered-by header', async () => {
    const response = await dsl.health.check();

    assert.equal(response.headers['x-powered-by'], undefined);
  });
});
