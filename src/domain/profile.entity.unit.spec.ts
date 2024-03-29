/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from 'node:assert/strict';
import test, { before, describe } from 'node:test';

import { initializeFactories } from '../../tests/factories/init.js';
import {
  clientFactory,
  profileFactory,
} from '../../tests/factories/profile.factory.js';

describe('Profile entity', () => {
  before(() => {
    initializeFactories();
  });

  test('is a client type', async () => {
    // Arrange
    const user = await profileFactory.build({ type: 'client' });

    // Assert
    assert.equal(user.isClient(), true);
    assert.equal(user.isContractor(), false);
  });

  test('is a contractor type', async () => {
    // Arrange
    const user = await profileFactory.build({ type: 'contractor' });

    // Assert
    assert.equal(user.isContractor(), true);
    assert.equal(user.isClient(), false);
  });

  test('has enough balance to pay for a job', async () => {
    // Arrange
    const user = await clientFactory.build({ balance: 100 });
    const jobPrice = 50;

    // Assert
    assert.equal(user.hasEnoughBalance(jobPrice), true);
  });

  test('pays for a job', async () => {
    // Arrange
    const user = await clientFactory.build({ balance: 100 });
    const jobPrice = 50;

    // Act
    user.pay(jobPrice);

    // Assert
    assert.equal(user.balance, 50);
  });
});
