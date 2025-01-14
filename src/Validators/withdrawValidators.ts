import { body, param, query } from 'express-validator'

const withdrawValidators = {
  createRequest: [
    body('amount')
      .isNumeric()
      .withMessage('Amount must be a numeric value.')
      .custom(value => value > 0)
      .withMessage('Amount must be greater than 0.'),
    body('walletName')
      .notEmpty()
      .withMessage('Wallet name is required.')
      .isString()
      .withMessage('Wallet name must be a string.'),
    body('walletPhoneNo')
      .notEmpty()
      .withMessage('Wallet phone number is required.')
      .matches(/^01\d{9}$/)
      .withMessage('Wallet phone number must be in the format 01XXXXXXXXX.'),
  ],

  getUserRequests: [
    query('status')
      .optional()
      .isIn(['pending', 'completed', 'rejected'])
      .withMessage('Status must be one of: pending, completed, rejected.'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer.'),
    query('pageSize')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page size must be a positive integer.'),
  ],

  cancelRequest: [
    param('withdrawId')
      .notEmpty()
      .withMessage('Withdrawal ID is required.')
      .isUUID()
      .withMessage('Withdrawal ID must be a valid UUID.'),
  ],

  getAllRequests: [
    query('status')
      .optional()
      .isIn(['pending', 'completed', 'rejected'])
      .withMessage('Status must be one of: pending, completed, rejected.'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer.'),
    query('pageSize')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page size must be a positive integer.'),
  ],

  rejectRequest: [
    param('withdrawId')
      .notEmpty()
      .withMessage('Withdrawal ID is required.')
      .isUUID()
      .withMessage('Withdrawal ID must be a valid UUID.'),
    body('remarks')
      .trim()
      .notEmpty()
      .withMessage('Remarks are required.')
      .isString()
      .withMessage('Remarks must be a string.'),
  ],

  completeRequest: [
    param('withdrawId')
      .notEmpty()
      .withMessage('Withdrawal ID is required.')
      .isUUID()
      .withMessage('Withdrawal ID must be a valid UUID.'),
    body('remarks')
      .optional()
      .isString()
      .withMessage('Remarks must be a string.'),
    body('transactionId')
      .trim()
      .notEmpty()
      .withMessage('Transaction ID is required.')
      .isString()
      .withMessage('Transaction ID must be a string.'),
    body('transactionPhoneNo')
      .notEmpty()
      .withMessage('Transaction phone number is required.')
      .matches(/^01\d{9}$/)
      .withMessage(
        'Transaction phone number must be in the format 01XXXXXXXXX.'
      ),
  ],
}

export default withdrawValidators
