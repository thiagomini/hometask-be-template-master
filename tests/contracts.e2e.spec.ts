/* eslint-disable @typescript-eslint/no-floating-promises */
import test, { describe } from 'node:test';

import { type Application } from 'express';
import request from 'supertest';

import app from '../src/app';

describe('Contracts', () => {
  describe('GET /contracts/:id', () => {
    test('Returns 401 when the user is not authenticated', async () => {
      await request(app as Application)
        .get('/contracts/1')
        .expect(401);
    });
    test.todo(
      'Returns the contract with the given id belonging to the requesting user',
    );
    test.todo(
      'Returns a 404 error if the contract with the given id does not exist',
    );
  });

  describe('GET /contracts', () => {
    test.todo(
      'Returns a list of non-terminated contracts belonging to the requesting user',
    );
    test.todo('Returns an empty list if the user has no contracts');

    test.todo('Returns 401 when the user is not authenticated');
  });
});
