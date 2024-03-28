import { type Express } from 'express';
import request from 'supertest';

export function health(app: Express) {
  return Object.freeze({
    check() {
      return request(app).get('/health').send();
    },
  });
}
