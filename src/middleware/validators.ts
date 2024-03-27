import { type NextFunction, type Request, type Response } from 'express';

import { badRequest } from '../errors';

export function validateParamId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;
  if (Number.isSafeInteger(+id) && +id <= 0) {
    return res
      .status(400)
      .json(
        badRequest({
          detail: 'Contract id must be a positive integer',
        }),
      )
      .end();
  }
  next();
}
