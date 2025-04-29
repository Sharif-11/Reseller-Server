"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDuePaymentRequestValidator = void 0;
const express_validator_1 = require("express-validator");
const createDuePaymentRequestValidator = () => [
    (0, express_validator_1.body)('amount')
        .isFloat({ gt: 0 })
        .withMessage('Amount must be a positive number'),
    (0, express_validator_1.body)('transactionId')
        .isString()
        .notEmpty()
        .withMessage('Transaction ID is required'),
    (0, express_validator_1.body)('sellerWalletName')
        .isString()
        .notEmpty()
        .withMessage('Seller wallet name is required'),
    (0, express_validator_1.body)('sellerWalletPhoneNo')
        .isString()
        .notEmpty()
        .withMessage('Seller wallet phone number is required'),
    (0, express_validator_1.body)('adminWalletId')
        .isInt({ gt: 0 })
        .withMessage('Admin wallet ID must be a positive integer'),
];
exports.createDuePaymentRequestValidator = createDuePaymentRequestValidator;
