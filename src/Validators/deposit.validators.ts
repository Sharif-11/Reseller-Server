// src/validators/transactionValidator.ts
import { body, param } from 'express-validator'

export const addDepositValidation = [
  // userId must be valid and trim it
  param('userId')
    .isString()
    .withMessage('User ID must be a valid string')
    .trim(),

  body('amount')
    .isFloat({ gt: 0 })
    .withMessage(
      'Amount must be a positive number and should be in decimal format'
    ),
  body('paymentMethod')
    .isString()
    .withMessage('Payment method is required')
    .notEmpty()
    .withMessage('Payment method cannot be empty'),
  body('transactionId')
    .isString()
    .withMessage('Transaction ID must be a string')
    .notEmpty()
    .withMessage('Transaction ID cannot be empty'),
  //must be a valid phone number of the format 01XXXXXXXXX
  body('paymentPhoneNo')
    .isMobilePhone('bn-BD')
    .withMessage('Phone number must be a valid Bangladeshi phone number'),
]
