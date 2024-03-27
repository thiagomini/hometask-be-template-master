import { type Express } from 'express';
import request from 'supertest';

import { type RequestOptions } from './request.options.js';
export type ContractOptions = RequestOptions;

export function contracts(app: Express) {
  return Object.freeze({
    getContractById(id: number, options?: ContractOptions) {
      return request(app)
        .get(`/contracts/${id}`)
        .set('profile_id', String(options?.profileId ?? ''));
    },
    list(options?: ContractOptions) {
      return request(app)
        .get('/contracts')
        .set('profile_id', String(options?.profileId ?? ''));
    },
  });
}
