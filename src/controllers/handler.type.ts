import { type NextFunction, type Request, type Response } from 'express';

type AnyObject = Record<string, unknown>;
type TypedRequest<
  ReqBody = AnyObject & Request,
  QueryString = AnyObject,
> = Request<AnyObject, AnyObject, ReqBody, Partial<QueryString>>;

export type ExpressHandler<
  ReqBody = AnyObject,
  Res = AnyObject | string,
  QueryString = AnyObject,
> = (
  req: TypedRequest<ReqBody, QueryString>,
  res: Response<Res>,
  next: NextFunction,
) =>
  | Promise<void | Response<Res>>
  | Promise<void>
  | ExpressHandler<ReqBody, Res, QueryString>
  | Response<unknown, Record<string, unknown>>
  | void;
