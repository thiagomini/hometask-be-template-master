/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from 'node:assert/strict';
import test, { before, describe } from 'node:test';

import { initializeFactories } from '../../tests/factories/init.js';
import {
  paidJobFactory,
  unpaidJobFactory,
} from '../../tests/factories/jobs.factory.js';

describe('Job entity', () => {
  before(() => {
    initializeFactories();
  });

  test('confirm payment', async () => {
    // Arrange
    const unpaidJob = await unpaidJobFactory.build({ price: 100 });
    const at = new Date();

    // Act
    unpaidJob.confirmPayment(at);

    // Assert
    assert.equal(unpaidJob.paid, true);
    assert.equal(unpaidJob.paymentDate, at);
  });

  test('cannot confirm payment twice', async () => {
    // Arrange
    const unpaidJob = await unpaidJobFactory.build({ price: 100 });
    const at = new Date();

    // Act
    unpaidJob.confirmPayment(at);

    // Assert
    assert.throws(() => unpaidJob.confirmPayment(at), /Job is already paid/);
  });

  test('cannot confirm payment of a paid job', async () => {
    // Arrange
    const paidJob = await paidJobFactory.build({ price: 100 });

    // Assert
    assert.throws(
      () => paidJob.confirmPayment(new Date()),
      /Job is already paid/,
    );
  });
});
