import { type Express } from 'express';
import request from 'supertest';

export function admin(app: Express) {
  return Object.freeze({
    bestProfession: ({ start, end }: { start: string; end: string }) => {
      return request(app).get(
        `/admin/best-profession?start=${start}&end=${end}`,
      );
    },
    bestClients: ({
      start,
      end,
      limit,
    }: {
      start: string;
      end: string;
      limit: number;
    }) => {
      return request(app).get(
        `/admin/best-clients?start=${start}&end=${end}&limit=${limit}`,
      );
    },
  });
}
