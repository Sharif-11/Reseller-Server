"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knownRequestHandler = void 0;
const knownRequestHandler = (error) => {
    const { code, meta } = error;
    console.error('Prisma Error:', { code, meta, message: error.message });
    switch (code) {
        case 'P2002': {
            const target = (meta === null || meta === void 0 ? void 0 : meta.target) ? `(${meta.target})` : '';
            return `Unique constraint failed ${target}. The value must be unique.`;
        }
        case 'P2003': {
            if (error.message.includes('`prisma.course.delete()` invocation')) {
                return 'Delete operation failed. The record is being referenced by other records.';
            }
            return 'Foreign key constraint failed.';
        }
        case 'P2025':
            return 'Record not found or already deleted.';
        case 'P2028': {
            const timeout = (meta === null || meta === void 0 ? void 0 : meta.timeout)
                ? `${meta.timeout} ms`
                : 'the configured timeout';
            return `Transaction expired after ${timeout}. Please retry the operation or optimize the transaction to complete faster.`;
        }
        default:
            return 'An unknown error occurred. Please contact support.';
    }
};
exports.knownRequestHandler = knownRequestHandler;
