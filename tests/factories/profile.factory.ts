import { faker } from '@faker-js/faker';
import { FactoryGirl } from 'factory-girl-ts';

import { Profile } from '../../src/model';
export const profileFactory = FactoryGirl.define(Profile, () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  profession: faker.person.jobTitle(),
  balance: faker.finance.amount(),
  type: faker.helpers.arrayElement(['client', 'contractor']),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
}));
