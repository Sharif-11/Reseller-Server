"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const prismaErrorHandler_1 = require("./prismaErrorHandler");
const httpStatus = require('http-status');
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler = (error, req, res, next) => {
    if (error instanceof ApiError_1.default) {
        const errorResponse = {
            statusCode: error.statusCode,
            success: false,
            message: error.message,
            stack: error.stack,
        };
        res.status(error.statusCode).json(errorResponse);
    }
    else if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        const errorResponse = {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: (0, prismaErrorHandler_1.knownRequestHandler)(error),
            stack: error === null || error === void 0 ? void 0 : error.stack,
        };
        res.status(httpStatus.BAD_REQUEST).json(errorResponse);
    }
    else if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        const errorResponse = {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: error === null || error === void 0 ? void 0 : error.message,
            stack: error === null || error === void 0 ? void 0 : error.stack,
        };
        res.status(400).json(errorResponse);
    }
    else if (error instanceof client_1.Prisma.PrismaClientInitializationError) {
        const errorResponse = {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Internal Server Error',
            stack: error === null || error === void 0 ? void 0 : error.stack,
        };
        res.status(400).json(errorResponse);
    }
    else {
        const errorResponse = {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: error.message,
        };
        res.status(400).json(errorResponse);
    }
};
exports.default = globalErrorHandler;
