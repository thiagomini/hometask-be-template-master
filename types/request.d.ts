// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express';

import { type Profile } from '../src/model.js';

declare global {
  namespace Express {
    export interface Request {
      profile: Profile;
    }
  }
}
