import { type Express } from 'express';

import { contracts } from './contracts.dsl';

export function createDSL(app: Express) {
  return Object.freeze({
    contracts: contracts(app),
  });
}
