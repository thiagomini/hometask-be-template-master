/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from 'node:assert';
import test, { describe } from 'node:test';

import { deposits } from './deposit-rules';

describe('Deposit rules', () => {
  describe('A client cannot deposit more than 25% of the total amount of unpaid jobs', () => {
    test('When the deposit amount is less than 25% of the total amount of unpaid jobs, the deposit is successful', () => {
      // Arrange
      const depositAmount = 99;
      const totalAmountToPay = 100;

      // Act
      const result = deposits.canDeposit(depositAmount, totalAmountToPay);

      // Assert
      assert.equal(result, true);
    });

    test('When the deposit amount is equal to 125% of the total amount of unpaid jobs, the deposit is successful', () => {
      // Arrange
      const depositAmount = 125;
      const totalAmountToPay = 100;

      // Act
      const result = deposits.canDeposit(depositAmount, totalAmountToPay);

      // Assert
      assert.equal(result, true);
    });

    test('When the deposit amount is more than 25% of the total amount of unpaid jobs, the deposit is unsuccessful', () => {
      // Arrange
      const depositAmount = 126;
      const totalAmountToPay = 100;

      // Act
      const result = deposits.canDeposit(depositAmount, totalAmountToPay);

      // Assert
      assert.equal(result, false);
    });
  });
});
