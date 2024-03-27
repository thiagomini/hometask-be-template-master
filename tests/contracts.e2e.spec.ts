/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from 'node:assert/strict';
import test, { describe } from 'node:test';

import { type Application } from 'express';
import { type InferCreationAttributes } from 'sequelize';
import request from 'supertest';

import { createDSL } from './dsl/dsl.factory';
import app from '../src/app';
import { Contract, Profile } from '../src/model';

describe('Contracts', () => {
  const dsl = createDSL(app);

  describe('GET /contracts/:id', () => {
    test('Returns 401 when the user is not authenticated', async () => {
      const response = await dsl.contracts.getContractById(1);
      assert.equal(response.status, 401);
    });
    test('Returns the contract with the given id belonging to the requesting client', async () => {
      // Arrange
      const aClient = await createProfile();
      const aContract = await createContract({
        terms: 'Some terms',
        status: 'new',
        clientId: aClient.id,
      });

      // Act
      const response = await dsl.contracts.getContractById(aContract.id, {
        profileId: aClient.id,
      });

      // Assert
      assert.equal(response.status, 200);
      assert.deepEqual(response.body, {
        id: aContract.id,
        terms: 'Some terms',
        status: 'new',
        createdAt: aContract.createdAt.toISOString(),
        updatedAt: aContract.updatedAt.toISOString(),
        clientId: aClient.id,
        contractorId: null,
      });
    });
    test('Returns the contract with the given id belonging to the requesting contractor', async () => {
      // Arrange
      const aContractor = await createProfile({
        type: 'contractor',
      });
      const aContract = await createContract({
        terms: 'Some terms',
        status: 'new',
        contractorId: aContractor.id,
      });

      // Act
      const response = await dsl.contracts.getContractById(aContract.id, {
        profileId: aContractor.id,
      });

      assert.equal(response.status, 200);
      assert.deepEqual(response.body, {
        id: aContract.id,
        terms: 'Some terms',
        status: 'new',
        createdAt: aContract.createdAt.toISOString(),
        updatedAt: aContract.updatedAt.toISOString(),
        contractorId: aContractor.id,
        clientId: null,
      });
    });
    test('Returns a 404 error if the contract with the given id does not exist', async () => {
      // Arrange
      const aClient = await createProfile();

      // Act
      const response = await dsl.contracts.getContractById(999999, {
        profileId: aClient.id,
      });

      // Assert
      assert.equal(response.status, 404);
      assert.deepEqual(response.body, {
        title: 'Entity not found',
        status: 404,
        detail: 'Contract with id 999999 not found for requesting user',
      });
    });
    test('Returns a 404 error if the contract with the given id does not belong to the requesting user', async () => {
      // Arrange
      const [aClient, anotherClient] = await Promise.all([
        createProfile(),
        createProfile(),
      ]);
      const aContract = await createContract({
        terms: 'Some terms',
        status: 'new',
        clientId: anotherClient.id,
      });

      // Act
      const response = await dsl.contracts.getContractById(aContract.id, {
        profileId: aClient.id,
      });

      // Assert
      assert.equal(response.status, 404);
      assert.deepEqual(response.body, {
        title: 'Entity not found',
        status: 404,
        detail: `Contract with id ${aContract.id} not found for requesting user`,
      });
    });
    test('Returns a 400 error when the contract id is not a positive number', async () => {
      // Arrange
      const aClient = await createProfile();

      // Act
      await request(app as Application)
        .get('/contracts/0')
        .set('profile_id', aClient.id.toString() as string)
        .expect(400, {
          title: 'Bad Request',
          status: 400,
          detail: 'Contract id must be a positive integer',
        });
    });
  });

  describe('GET /contracts', () => {
    test('Returns an empty list if the user has no contracts', async () => {
      // Arrange
      const aClient = await createProfile();

      // Act
      await request(app as Application)
        .get('/contracts')
        .set('profile_id', aClient.id.toString() as string)
        .expect(200, []);
    });
    test('Returns a list of non-terminated contracts belonging to the requesting user', async () => {
      // Arrange
      const aClient = await createProfile();
      const [aContract, _terminatedContract] = await Promise.all([
        createContract({
          terms: 'Some terms',
          status: 'new',
          clientId: aClient.id,
        }),
        createContract({
          terms: 'Some terms',
          status: 'terminated',
          clientId: aClient.id,
        }),
      ]);

      // Act
      await request(app as Application)
        .get('/contracts')
        .set('profile_id', aClient.id.toString() as string)
        .expect(200, [
          {
            id: aContract.id,
            terms: 'Some terms',
            status: 'new',
            createdAt: aContract.createdAt.toISOString(),
            updatedAt: aContract.updatedAt.toISOString(),
            clientId: aClient.id,
            contractorId: null,
          },
        ]);
    });

    test('Returns 401 when the user is not authenticated', async () => {
      await request(app as Application)
        .get('/contracts')
        .expect(401);
    });
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