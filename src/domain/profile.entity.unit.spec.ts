/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from 'node:assert/strict';
import test, { before, describe } from 'node:test';

import { initializeFactories } from '../../tests/factories/init.js';
import { profileFactory } from '../../tests/factories/profile.factory.js';

describe('Profile entity', () => {
  before(() => {
    initializeFactories();
  });

  test('is a client type', async () => {
    // Arrange
    const user = await profileFactory.build({ type: 'client' });

    // Act
    const result = user.isClient();

    // Assert
    assert.equal(result, true);
  });
});
