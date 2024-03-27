import { type Express } from 'express';
import request from 'supertest';

import { type RequestOptions } from './request.options';

export type BalanceOptions = RequestOptions;

export function balances(app: Express) {
  return Object.freeze({
    deposit: (amount: number, options: RequestOptions) => {
      return request(app)
        .post(`/balances/deposit/${options.profileId}`)
        .send({ amount });
    },
  });
}
