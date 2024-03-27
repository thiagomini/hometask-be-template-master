/* eslint-disable @typescript-eslint/no-floating-promises */
import test, { before, describe } from 'node:test';


import { createDSL } from './dsl/dsl.factory.js';
import { contractFactory } from './factories/contract.factory.js';
import { initializeFactories } from './factories/init.js';
import {
  clientFactory,
  contractorFactory,
} from './factories/profile.factory.js';
import app from '../src/app.js';

describe('Contracts E2E', () => {
  const dsl = createDSL(app);

  before(() => {
    initializeFactories();
  });

  describe('GET /contracts/:id', () => {
    test('Returns 401 when the user is not authenticated', async () => {
      await dsl.contracts.getContractById(1).expect(401);
    });
    test('Returns the contract with the given id belonging to the requesting client', async () => {
      // Arrange
      const aClient = await clientFactory.create();
      const aContract = await contractFactory.create({
        terms: 'Some terms',
        status: 'new',
        clientId: aClient.id,
      });

      // Act
      await dsl.contracts
        .getContractById(aContract.id, {
          profileId: aClient.id,
        })
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
    test('Returns the contract with the given id belonging to the requesting contractor', async () => {
      // Arrange
      const aContractor = await contractorFactory.create();
      const aContract = await contractFactory.create({
        terms: 'Some terms',
        status: 'new',
        contractorId: aContractor.id,
      });

      // Act
      await dsl.contracts
        .getContractById(aContract.id, {
          profileId: aContractor.id,
        })
        .expect(200, {
          id: aContract.id,
          terms: 'Some terms',
          status: 'new',
          createdAt: aContract.createdAt.toISOString(),
          updatedAt: aContract.updatedAt.toISOString(),
          clientId: null,
          contractorId: aContractor.id,
        });
    });
    test.skip('Returns a 404 error if the contract with the given id does not exist', async () => {
      // Arrange
      const aClient = await clientFactory.create();

      // Act
      await dsl.contracts
        .getContractById(999999, {
          profileId: aClient.id,
        })
        .expect(404, {
          title: 'Entity not found',
          status: 404,
          detail: 'Contract with id 999999 not found for requesting user',
        });
    });
    test('Returns a 404 error if the contract with the given id does not belong to the requesting user', async () => {
      // Arrange
      const [aClient, anotherClient] = await clientFactory.createMany(2);
      const aContract = await contractFactory.create({
        terms: 'Some terms',
        status: 'new',
        clientId: anotherClient.id,
      });

      // Act
      await dsl.contracts
        .getContractById(aContract.id, {
          profileId: aClient.id,
        })
        .expect(404, {
          title: 'Entity not found',
          status: 404,
          detail: `Contract with id ${aContract.id} not found for requesting user`,
        });
    });
    test('Returns a 400 error when the contract id is not a positive number', async () => {
      // Arrange
      const aClient = await clientFactory.create();

      // Act
      await dsl.contracts
        .getContractById(0, {
          profileId: aClient.id,
        })
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
      const aClient = await clientFactory.create();

      // Act
      await dsl.contracts.list({ profileId: aClient.id }).expect(200, []);
    });
    test('Returns a list of non-terminated contracts belonging to the requesting user', async () => {
      // Arrange
      const aClient = await clientFactory.create();
      const [aContract, _terminatedContract] = await contractFactory.createMany(
        2,
        [
          {
            terms: 'Some terms',
            status: 'new',
            clientId: aClient.id,
          },
          {
            terms: 'Some terms',
            status: 'terminated',
            clientId: aClient.id,
          },
        ],
      );

      // Act
      await dsl.contracts.list({ profileId: aClient.id }).expect(200, [
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
      await dsl.contracts.list().expect(401);
    });
  });
});
