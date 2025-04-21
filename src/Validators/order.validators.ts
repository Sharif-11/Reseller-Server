import { body, check } from 'express-validator';

export const validateCreateOrder = [
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('গ্রাহকের নাম প্রয়োজন।')
    .isLength({ max: 48 })
    .withMessage('গ্রাহকের নাম আরও ছোট হতে হবে।'),

  body('customerPhoneNo')
    .trim()
    .notEmpty()
    .withMessage('গ্রাহকের ফোন নম্বর প্রয়োজন।')
    .matches(/^01\d{9}$/)
    .withMessage('গ্রাহকের ফোন নম্বরটি সঠিক নয়।'),

  body('customerZilla')
    .trim()
    .notEmpty()
    .withMessage('গ্রাহকের জেলা প্রয়োজন।')
    .isLength({ max: 48 })
    .withMessage('গ্রাহকের জেলার নাম আরও ছোট হতে হবে।'),

  body('customerUpazilla')
    .trim()
    .notEmpty()
    .withMessage('গ্রাহকের উপজেলা প্রয়োজন।')
    .isLength({ max: 48 })
    .withMessage('গ্রাহকের উপজেলার নাম আরও ছোট হতে হবে।'),

  body('deliveryAddress')
    .trim()
    .notEmpty()
    .withMessage('ডেলিভারি ঠিকানা প্রয়োজন।')
    .isLength({ max: 255 })
    .withMessage('ডেলিভারি ঠিকানা আরও ছোট হতে হবে।'),

  body('comments')
    .optional()
    .trim()
    .isLength({ max: 512 })
    .withMessage('মন্তব্য আরও ছোট হতে হবে।'),
    
  body('isDeliveryChargePaidBySeller')
    .isBoolean()
    .withMessage('ডেলিভারি চার্জ প্রদানের তথ্য সঠিক নয়।'),

  body('deliveryChargePaidBySeller')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('প্রদত্ত ডেলিভারি চার্জ সঠিক নয়।'),

  // Conditional validations for seller-paid delivery
  check('transactionId')
    .if(body('isDeliveryChargePaidBySeller').equals('true'))
    .trim()
    .notEmpty()
    .withMessage('ডেলিভারি চার্জ বিক্রেতা প্রদান করলে লেনদেন আইডি প্রয়োজন।')
    .isLength({ max: 64 })
    .withMessage('লেনদেন আইডি আরও ছোট হতে হবে।')
    .optional(),

  check('adminWalletId')
    .if(body('isDeliveryChargePaidBySeller').equals('true'))
    .isInt({ min: 1 })
    .withMessage('ডেলিভারি চার্জ বিক্রেতা প্রদান করলে অ্যাডমিন ওয়ালেট আইডি প্রয়োজন।')
    .optional(),

  body('sellerWalletName')
    .if(body('isDeliveryChargePaidBySeller').equals('true'))
    .trim()
    .notEmpty()
    .withMessage('বিক্রেতার ওয়ালেট নাম প্রয়োজন।'),


  body('sellerWalletPhoneNo')
    .if(body('isDeliveryChargePaidBySeller').equals('true'))
    .trim()
    .notEmpty()
    .withMessage('বিক্রেতার ফোন নম্বর প্রয়োজন।')
    .matches(/^01\d{9}$/)
    .withMessage('বিক্রেতার ফোন নম্বর সঠিক নয়।'),
];