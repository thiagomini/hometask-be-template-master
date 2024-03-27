import { type Express } from 'express';
import request from 'supertest';

export type ContractOptions = {
  profileId: number;
};

export function contracts(app: Express) {
  return Object.freeze({
    getContractById(id: number, options?: ContractOptions) {
      return request(app)
        .get(`/contracts/${id}`)
        .set('profile_id', options?.profileId.toString() ?? '');
    },
    list(options?: ContractOptions) {
      return request(app)
        .get('/contracts')
        .set('profile_id', options?.profileId.toString() ?? '');
    },
  });
}