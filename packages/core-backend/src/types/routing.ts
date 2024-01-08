import type { NextFunction, Request, Response } from "express"

import type { User } from "../models"
import type { AutoflowContainer } from "./global"

export interface AutoflowRequest extends Request {
  user?: (User) & { userId?: string }
  scope: AutoflowContainer
}

export type AutoflowResponse = Response

export type AutoflowNextFunction = NextFunction

export type AutoflowRequestHandler = (
  req: AutoflowRequest,
  res: AutoflowResponse,
  next:AutoflowNextFunction
) => Promise<void> | void