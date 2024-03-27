/* eslint-disable @typescript-eslint/no-floating-promises */
import test, { describe } from 'node:test';

import { type Application } from 'express';
import { type InferCreationAttributes } from 'sequelize';
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
      const aClient = await createProfile();
      const aContract = await createContract({
        terms: 'Some terms',
        status: 'new',
        clientId: aClient.id,
      });

      // Act
      await request(app as Application)
        .get(`/contracts/${aContract.id}`)
        .set('profile_id', aClient.id.toString() as string)
        .expect(200, {
          id: aContract.id,
          terms: 'Some terms',
          status: 'new',
          createdAt: aContract.createdAt.toISOString(),
          updatedAt: aContract.updatedAt.toISOString(),
          clientId: aClient.id,
          contractorId: null,
        });
    });
    test(
      'Returns a 404 error if the contract with the given id does not exist',
    ),
      async () => {
        // Arrange
        const aClient = await createProfile();

        // Act
        await request(app as Application)
          .get('/contracts/999999')
          .set('profile_id', aClient.id.toString() as string)
          .expect(404);
      };
  });

  describe('GET /contracts', () => {
    test.todo(
      'Returns a list of non-terminated contracts belonging to the requesting user',
    );
    test.todo('Returns an empty list if the user has no contracts');

    test.todo('Returns 401 when the user is not authenticated');
  });
});

async function createProfile(
  attributes: Partial<InferCreationAttributes<Profile>> = {},
): Promise<Profile> {
  return await Profile.create({
    firstName: 'John',
    lastName: 'Doe',
    profession: 'Software Engineer',
    balance: 1000,
    type: 'client',
    ...attributes,
  });
}

async function createContract(
  attributes: Partial<InferCreationAttributes<Contract>> = {},
): Promise<Contract> {
  return await Contract.create({
    terms: 'Some terms',
    status: 'new',
    ...attributes,
  });
}