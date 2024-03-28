import { type Express } from 'express';
import request from 'supertest';

import { type RequestOptions } from './request.options.js';

export type BalanceOptions = RequestOptions;

export function balances(app: Express) {
  return Object.freeze({
    deposit: ({ amount, userId }: { amount: number; userId: number }) => {
      return request(app).post(`/balances/deposit/${userId}`).send({ amount });
    },
  });
}
