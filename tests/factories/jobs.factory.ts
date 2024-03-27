import { faker } from '@faker-js/faker';
import { FactoryGirl } from 'factory-girl-ts';

import { contractFactory } from './contract.factory.js';
import { Job } from '../../src/model.js';

export const jobsFactory = FactoryGirl.define(Job, () => {
  const paid = faker.datatype.boolean();
  return {
    description: faker.lorem.sentence(),
    price: faker.finance.amount(),
    paid: faker.datatype.boolean(),
    paymentDate: paid ? faker.date.recent() : null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    contractId: contractFactory.associate('id'),
  };
});
