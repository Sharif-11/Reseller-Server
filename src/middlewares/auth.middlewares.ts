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

export const verifySeller = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'Seller') {
    return next(new ApiError(403, 'Access forbidden: Sellers only'))
  }
  next()
}
export const verifyAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'Admin') {
    return next(new ApiError(403, 'Access forbidden: Admins only'))
  }
  next()
}
