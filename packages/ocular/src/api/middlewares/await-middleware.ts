import { NextFunction, Request, RequestHandler, Response } from "express"

type handler = (req: Request, res: Response) => Promise<void>

export default (fn: handler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req?.errors?.length) {
      return res.status(400).json({
        errors: req.errors,
        message:
          "Provided request body contains errors. Please check the data and retry the request",
      })
    }

    try {
      return await fn(req, res)
    } catch (err) {
      next(err)
    }
  }
}