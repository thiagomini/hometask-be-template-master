import { type Express, type RequestHandler } from 'express';

import { findBestClients } from '../application/find-best-clients.query.js';
import { findBestProfession } from '../application/find-best-profession.query.js';

export function registerAdminRoutes(app: Express) {
  app.get('/admin/best-profession', findBestProfession as RequestHandler);
  app.get('/admin/best-clients', findBestClients as RequestHandler);
}
