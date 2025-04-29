import { body } from 'express-validator'

export const createDuePaymentRequestValidator = () => [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('transactionId')
    .isString()
    .notEmpty()
    .withMessage('Transaction ID is required'),
  body('sellerWalletName')
    .isString()
    .notEmpty()
    .withMessage('Seller wallet name is required'),
  body('sellerWalletPhoneNo')
    .isString()
    .notEmpty()
    .withMessage('Seller wallet phone number is required'),
  body('adminWalletId')
    .isInt({ gt: 0 })
    .withMessage('Admin wallet ID must be a positive integer'),
]
