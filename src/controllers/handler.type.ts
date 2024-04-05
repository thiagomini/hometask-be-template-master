import { type NextFunction, type Request, type Response } from 'express';

type AnyObject = Record<string, unknown>;
type TypedRequest<
  ReqBody = AnyObject & Request,
  QueryString = AnyObject,
  ReqParams = AnyObject,
> = Request<ReqParams, AnyObject, ReqBody, Partial<QueryString>>;

/**
 * This is a middle-grounds between coupling and modularity for request handlers. I could
 * create an additional layer (or "port") to translate the request parameters to defined objects
 * so that commands and queries don't have to know how to get their values.
 */
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
