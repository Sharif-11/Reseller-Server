//A middleware to ck if the user is authenticated

import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import config from '../config'
import ApiError from '../utils/ApiError'

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  if (!token) {
    return next(new ApiError(401, 'Unauthorized'))
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret as string)
    req.user = payload as any
    next()
  } catch (error) {
    next(new ApiError(401, 'Unauthorized'))
  }
}
