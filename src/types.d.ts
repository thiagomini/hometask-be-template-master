// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type Request } from 'express';

import { type Profile } from './model';
declare global {
  namespace Express {
    export interface Request {
      profile: Profile;
    }
  }
}
