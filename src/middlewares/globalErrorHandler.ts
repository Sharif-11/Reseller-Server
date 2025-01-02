import { Prisma } from '@prisma/client'
import { ErrorRequestHandler } from 'express'
import config from '../config'
import ApiError from '../utils/ApiError'
import { knownRequestHandler } from './prismaErrorHandler'
const httpStatus = require('http-status')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof ApiError) {
    const errorResponse = {
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      stack: config.nodeEnv === 'development' ? error.stack : undefined,
    }
    res.status(error.statusCode).json(errorResponse)
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const errorResponse = {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: knownRequestHandler(error),
      stack: error?.stack,
    }
    res.status(httpStatus.BAD_REQUEST).json(errorResponse)
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    const errorResponse = {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: error?.message,
      stack: error?.stack,
    }
    res.status(400).json(errorResponse)
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    const errorResponse = {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Internal Server Error',
      stack: error?.stack,
    }
    res.status(400).json(errorResponse)
  } else {
    const errorResponse = {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: error.message,
    }
    res.status(400).json(errorResponse)
  }
}
export default globalErrorHandler
