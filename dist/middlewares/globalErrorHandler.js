"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("../config"));
const ApiError_1 = __importStar(require("../utils/ApiError"));
const prismaErrorHandler_1 = require("./prismaErrorHandler");
const httpStatus = require('http-status');
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler = (error, req, res, next) => {
    if (error instanceof ApiError_1.default || error instanceof ApiError_1.SmsServiceError) {
        const errorResponse = {
            statusCode: error.statusCode,
            success: false,
            message: error.message,
            stack: config_1.default.nodeEnv === 'development' ? error.stack : undefined,
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
