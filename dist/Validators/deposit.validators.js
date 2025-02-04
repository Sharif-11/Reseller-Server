"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDepositValidation = void 0;
// src/validators/transactionValidator.ts
const express_validator_1 = require("express-validator");
exports.addDepositValidation = [
    // userId must be valid and trim it
    (0, express_validator_1.param)('userId')
        .isString()
        .withMessage('User ID must be a valid string')
        .trim(),
    (0, express_validator_1.body)('amount')
        .isFloat({ gt: 0 })
        .withMessage('Amount must be a positive number and should be in decimal format'),
    (0, express_validator_1.body)('paymentMethod')
        .isString()
        .withMessage('Payment method is required')
        .notEmpty()
        .withMessage('Payment method cannot be empty'),
    (0, express_validator_1.body)('transactionId')
        .isString()
        .withMessage('Transaction ID must be a string')
        .notEmpty()
        .withMessage('Transaction ID cannot be empty'),
    //must be a valid phone number of the format 01XXXXXXXXX
    (0, express_validator_1.body)('paymentPhoneNo')
        .isMobilePhone('bn-BD')
        .withMessage('Phone number must be a valid Bangladeshi phone number'),
];
