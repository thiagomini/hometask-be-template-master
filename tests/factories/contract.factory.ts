import { faker } from '@faker-js/faker';
import { FactoryGirl } from 'factory-girl-ts';

import { Contract } from '../../src/model';

export const contractFactory = FactoryGirl.define(Contract, () => ({
  terms: faker.lorem.sentence(),
  status: 'new',
  createdAt: new Date('2020-01-01'),
  updatedAt: new Date('2020-01-01'),
  clientId: null,
  contractorId: null,
}));
