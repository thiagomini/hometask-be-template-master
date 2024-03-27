/* eslint-disable @typescript-eslint/no-floating-promises */
import test, { describe } from 'node:test';

describe('Contracts', () => {
  describe('GET /contracts', () => {
    test.todo(
      'Returns a list of non-terminated contracts belonging to the requesting user',
    );
    test.todo('Returns an empty list if the user has no contracts');
  });

  describe('GET /contracts/:id', () => {
    test.todo(
      'Returns the contract with the given id belonging to the requesting user',
    );
    test.todo(
      'Returns a 404 error if the contract with the given id does not exist',
    );
  });
});
