import { body, param, query } from 'express-validator'

// Validator for `createAdmin`
export const validateCreateAdmin = [
  body('phoneNo')
    .trim()
    .notEmpty()
    .withMessage('ফোন নম্বর প্রয়োজন।')
    .matches(/^01\d{9}$/)
    .withMessage('ফোন নম্বরটি সঠিক নয়।'),
  body('name')
    .trim()
    .isLength({ max: 48 })
    .withMessage('নামটি আরও ছোট হতে হবে।'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('পাসওয়ার্ড প্রয়োজন।')
    .isLength({ min: 6 })
    .withMessage('পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।')
    .isLength({ max: 16 })
    .withMessage('পাসওয়ার্ডটি আরও ছোট হতে হবে।'),
  body('email').optional().trim().isEmail().withMessage('ইমেইলটি সঠিক নয়।'),
  body('shopName')
    .trim()
    .notEmpty()
    .withMessage('দোকানের নাম প্রয়োজন।')
    .isLength({ max: 32 })
    .withMessage('দোকানের নাম আরও ছোট হতে হবে।'),
  body('zilla')
    .trim()
    .notEmpty()
    .withMessage('জেলার নাম প্রয়োজন।')
    .isLength({ max: 48 })
    .withMessage('জেলার নাম আরও ছোট হতে হবে।'),
  body('upazilla')
    .trim()
    .notEmpty()
    .withMessage('উপজেলার নাম প্রয়োজন।')
    .isLength({ max: 48 })
    .withMessage('উপজেলার নাম আরও ছোট হতে হবে।'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('ঠিকানা প্রয়োজন।')
    .isLength({ max: 255 })
    .withMessage('ঠিকানা আরও ছোট হতে হবে।'),
  body('nomineePhone')
    .trim()
    .optional()
    .matches(/^01\d{9}$/)
    .withMessage('নমিনির ফোন নম্বরটি সঠিক নয়।'),
]

// Validator for `createSeller`

export const validateCreateSeller = [
  body('phoneNo')
    .trim()
    .notEmpty()
    .withMessage('ফোন নম্বর প্রয়োজন।')
    .matches(/^01\d{9}$/)
    .withMessage('ফোন নম্বরটি সঠিক নয়।'),

  body('name')
    .trim()
    .isLength({ max: 48 })
    .withMessage('নামটি আরও ছোট হতে হবে।'),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('পাসওয়ার্ড প্রয়োজন।')
    .isLength({ min: 6 })
    .withMessage('পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।')
    .isLength({ max: 16 })
    .withMessage('পাসওয়ার্ডটি আরও ছোট হতে হবে।'),

  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('ইমেইলটি সঠিক নয়।'),

  body('shopName')
    .trim()
    .notEmpty()
    .withMessage('দোকানের নাম প্রয়োজন।')
    .isLength({ max: 32 })
    .withMessage('দোকানের নাম আরও ছোট হতে হবে।'),

  body('zilla')
    .trim()
    .notEmpty()
    .withMessage('জেলার নাম প্রয়োজন।')
    .isLength({ max: 48 })
    .withMessage('জেলার নাম আরও ছোট হতে হবে।'),

  body('upazilla')
    .trim()
    .notEmpty()
    .withMessage('উপজেলার নাম প্রয়োজন।')
    .isLength({ max: 48 })
    .withMessage('উপজেলার নাম আরও ছোট হতে হবে।'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('ঠিকানা প্রয়োজন।')
    .isLength({ max: 255 })
    .withMessage('ঠিকানা আরও ছোট হতে হবে।'),

  body('nomineePhone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^01\d{9}$/)
    .withMessage('নমিনির ফোন নম্বরটি সঠিক নয়।'),

  body('referralCode')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage(
      'রেফারাল কোডটি শুধুমাত্র অক্ষর, সংখ্যা, (-) এবং (_) থাকতে পারে।'
    )
    .isLength({ max: 16, min: 3 })
    .withMessage('রেফারাল কোডটি ৩ থেকে ১৬ অক্ষরের মধ্যে হতে হবে।'),
]

// Validator for `loginWithPhoneNoAndPassword`
export const validateLoginWithPhoneNoAndPassword = [
  body('phoneNo')
    .trim()
    .notEmpty()
    .withMessage('ফোন নম্বর প্রয়োজন।')
    .matches(/^01\d{9}$/)
    .withMessage('ফোন নম্বরটি সঠিক নয়।'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('পাসওয়ার্ড প্রয়োজন।')
    .isLength({ min: 6 })
    .withMessage('পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।')
    .isLength({ max: 16 })
    .withMessage('পাসওয়ার্ডটি আরও ছোট হতে হবে।'),
]

// Validator for `sendOtp`
export const validateSendOtp = [
  body('phoneNo')
    .trim()
    .notEmpty()
    .withMessage('ফোন নম্বর প্রয়োজন।')
    .matches(/^01\d{9}$/)
    .withMessage('ফোন নম্বরটি সঠিক নয়।'),
]

// Validator for `verifyOtp`
export const validateVerifyOtp = [
  body('phoneNo')
    .trim()
    .notEmpty()
    .withMessage('ফোন নম্বর প্রয়োজন।')
    .matches(/^01\d{9}$/)
    .withMessage('ফোন নম্বরটি সঠিক নয়।'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP ৬ অক্ষরের হতে হবে।'),
]

// Validator for `updateProfile`
export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 48 })
    .withMessage('নামটি আরও ছোট হতে হবে।'),
  body('email').optional().trim().isEmail().withMessage('ইমেইলটি সঠিক নয়।'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('ঠিকানা আরও ছোট হতে হবে।'),
  body('nomineePhone')
    .optional()
    .trim()
    .matches(/^01\d{9}$/)
    .withMessage('নমিনির ফোন নম্বরটি সঠিক নয়।'),
  body('zilla')
    .optional()
    .trim()
    .isLength({ max: 48 })
    .withMessage('জেলার নাম আরও ছোট হতে হবে।'),
  body('upazilla')
    .optional()
    .trim()
    .isLength({ max: 48 })
    .withMessage('উপজেলার নাম আরও ছোট হতে হবে।'),
  body('shopName')
    .optional()
    .trim()
    .isLength({ max: 32 })
    .withMessage('দোকানের নাম আরও ছোট হতে হবে।'),
]

// Validator for `updatePassword`
export const validateChangePassword = [
  body('currentPassword')
    .trim()
    .notEmpty()
    .withMessage('বর্তমান পাসওয়ার্ড প্রয়োজন।'),
  body('newPassword')
    .trim()
    .isLength({ min: 6 })
    .withMessage('নতুন পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।')
    .isLength({ max: 16 })
    .withMessage('নতুন পাসওয়ার্ডটি আরও ছোট হতে হবে।'),
]

// Validator for `addReferralCode`
export const validateAddReferralCode = [
  body('referralCode')
    .trim()
    .notEmpty()
    .withMessage('রেফারাল কোড প্রয়োজন।')
    .isLength({ max: 32 })
    .withMessage('রেফারাল কোড আরও ছোট হতে হবে।'),
]

// Validator for `getUserByPhoneNo`
export const validateGetUserByPhoneNo = [
  param('phoneNo')
    .trim()
    .notEmpty()
    .withMessage('ফোন নম্বর প্রয়োজন।')
    .matches(/^01\d{9}$/)
    .withMessage('ফোন নম্বরটি সঠিক নয়।'),
]

// Validator for `getAllUsers`
export const validateGetAllUsers = [
  query('phoneNo')
    .optional()
    .trim()
    .matches(/^01\d{9}$/)
    .withMessage('ফোন নম্বরটি সঠিক নয়।'),
  query('name')
    .optional()
    .trim()
    .isLength({ max: 48 })
    .withMessage('নামটি আরও ছোট হতে হবে।'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('পৃষ্ঠা নম্বর সঠিক নয়।'),
  query('pageSize')
    .optional()
    .isInt({ min: 1 })
    .withMessage('পৃষ্ঠা আকার সঠিক নয়।'),
]

// Validator for `forgotPassword`
export const validateForgotPassword = [
  body('phoneNo')
    .trim()
    .notEmpty()
    .withMessage('ফোন নম্বর প্রয়োজন।')
    .matches(/^01\d{9}$/)
    .withMessage('ফোন নম্বরটি সঠিক নয়।'),
]
