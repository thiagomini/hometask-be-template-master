/* eslint-disable @typescript-eslint/no-floating-promises */
import test, { describe } from 'node:test';

import { type Application } from 'express';
import request from 'supertest';

import app from '../src/app';
import { Contract, Profile } from '../src/model';

describe('Contracts', () => {
  describe('GET /contracts/:id', () => {
    test('Returns 401 when the user is not authenticated', async () => {
      await request(app as Application)
        .get('/contracts/1')
        .expect(401);
    });
    test('Returns the contract with the given id belonging to the requesting user', async () => {
      // Arrange
      const aClient = await Profile.create({
        firstName: 'John',
        lastName: 'Doe',
        profession: 'Software Engineer',
        balance: 1000,
        type: 'client',
      });
      const aContract = await Contract.create({
        terms: 'Some terms',
        status: 'new',
        clientId: aClient.get('id'),
      });

      // Act
      await request(app as Application)
        .get(`/contracts/${aContract.get('id')}`)
        .set('profile_id', aClient.get('id').toString() as string)
        .expect(200, {
          id: aContract.get('id'),
          terms: 'Some terms',
          status: 'new',
          createdAt: aContract.get('createdAt').toISOString(),
          updatedAt: aContract.get('updatedAt').toISOString(),
          clientId: aClient.get('id'),
          contractorId: null,
        });
    });
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
