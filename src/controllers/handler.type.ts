import { type NextFunction, type Request, type Response } from 'express';

type AnyObject = Record<string, unknown>;
type TypedRequest<
  ReqBody = AnyObject & Request,
  QueryString = AnyObject,
  ReqParams = AnyObject,
> = Request<ReqParams, AnyObject, ReqBody, Partial<QueryString>>;

export type ExpressHandler<
  ReqBody = AnyObject,
  Res = AnyObject | string,
  QueryString = AnyObject,
  ReqParams = AnyObject,
> = (
  req: TypedRequest<ReqBody, QueryString, ReqParams>,
  res: Response<Res>,
  next: NextFunction,
) =>
  | Promise<void | Response<Res>>
  | Promise<void>
  | ExpressHandler<ReqBody, Res, QueryString>
  | Response<unknown, Record<string, unknown>>
  | void;
