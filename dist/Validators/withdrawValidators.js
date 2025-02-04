"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const withdrawValidators = {
    createRequest: [
        (0, express_validator_1.body)('amount')
            .isNumeric()
            .withMessage('Amount must be a numeric value.')
            .custom(value => value > 0)
            .withMessage('Amount must be greater than 0.'),
        (0, express_validator_1.body)('walletName')
            .notEmpty()
            .withMessage('Wallet name is required.')
            .isString()
            .withMessage('Wallet name must be a string.'),
        (0, express_validator_1.body)('walletPhoneNo')
            .notEmpty()
            .withMessage('Wallet phone number is required.')
            .matches(/^01\d{9}$/)
            .withMessage('Wallet phone number must be in the format 01XXXXXXXXX.'),
    ],
    getUserRequests: [
        (0, express_validator_1.query)('status')
            .optional()
            .isIn(['pending', 'completed', 'rejected'])
            .withMessage('Status must be one of: pending, completed, rejected.'),
        (0, express_validator_1.query)('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer.'),
        (0, express_validator_1.query)('pageSize')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page size must be a positive integer.'),
    ],
    cancelRequest: [
        (0, express_validator_1.param)('withdrawId')
            .notEmpty()
            .withMessage('Withdrawal ID is required.')
            .isUUID()
            .withMessage('Withdrawal ID must be a valid UUID.'),
    ],
    getAllRequests: [
        (0, express_validator_1.query)('status')
            .optional()
            .isIn(['pending', 'completed', 'rejected'])
            .withMessage('Status must be one of: pending, completed, rejected.'),
        (0, express_validator_1.query)('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer.'),
        (0, express_validator_1.query)('pageSize')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page size must be a positive integer.'),
    ],
    rejectRequest: [
        (0, express_validator_1.param)('withdrawId')
            .notEmpty()
            .withMessage('Withdrawal ID is required.')
            .isUUID()
            .withMessage('Withdrawal ID must be a valid UUID.'),
        (0, express_validator_1.body)('remarks')
            .trim()
            .notEmpty()
            .withMessage('Remarks are required.')
            .isString()
            .withMessage('Remarks must be a string.'),
    ],
    completeRequest: [
        (0, express_validator_1.param)('withdrawId')
            .notEmpty()
            .withMessage('Withdrawal ID is required.')
            .isUUID()
            .withMessage('Withdrawal ID must be a valid UUID.'),
        (0, express_validator_1.body)('remarks')
            .optional()
            .isString()
            .withMessage('Remarks must be a string.'),
        (0, express_validator_1.body)('transactionId')
            .trim()
            .notEmpty()
            .withMessage('Transaction ID is required.')
            .isString()
            .withMessage('Transaction ID must be a string.'),
        (0, express_validator_1.body)('transactionPhoneNo')
            .notEmpty()
            .withMessage('Transaction phone number is required.')
            .matches(/^01\d{9}$/)
            .withMessage('Transaction phone number must be in the format 01XXXXXXXXX.'),
    ],
};
exports.default = withdrawValidators;
