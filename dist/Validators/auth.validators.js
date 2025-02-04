"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateForgotPassword = exports.validateGetAllUsers = exports.validateGetUserByPhoneNo = exports.validateAddReferralCode = exports.validateChangePassword = exports.validateUpdateProfile = exports.validateVerifyOtp = exports.validateSendOtp = exports.validateLoginWithPhoneNoAndPassword = exports.validateCreateSeller = exports.validateCreateAdmin = void 0;
const express_validator_1 = require("express-validator");
// Validator for `createAdmin`
exports.validateCreateAdmin = [
    (0, express_validator_1.body)('phoneNo')
        .trim()
        .notEmpty()
        .withMessage('ফোন নম্বর প্রয়োজন।')
        .matches(/^01\d{9}$/)
        .withMessage('ফোন নম্বরটি সঠিক নয়।'),
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ max: 48 })
        .withMessage('নামটি আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('password')
        .trim()
        .notEmpty()
        .withMessage('পাসওয়ার্ড প্রয়োজন।')
        .isLength({ min: 6 })
        .withMessage('পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।')
        .isLength({ max: 16 })
        .withMessage('পাসওয়ার্ডটি আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('email').optional().trim().isEmail().withMessage('ইমেইলটি সঠিক নয়।'),
    (0, express_validator_1.body)('shopName')
        .trim()
        .notEmpty()
        .withMessage('দোকানের নাম প্রয়োজন।')
        .isLength({ max: 32 })
        .withMessage('দোকানের নাম আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('zilla')
        .trim()
        .notEmpty()
        .withMessage('জেলার নাম প্রয়োজন।')
        .isLength({ max: 48 })
        .withMessage('জেলার নাম আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('upazilla')
        .trim()
        .notEmpty()
        .withMessage('উপজেলার নাম প্রয়োজন।')
        .isLength({ max: 48 })
        .withMessage('উপজেলার নাম আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('address')
        .trim()
        .notEmpty()
        .withMessage('ঠিকানা প্রয়োজন।')
        .isLength({ max: 255 })
        .withMessage('ঠিকানা আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('nomineePhone')
        .trim()
        .optional()
        .matches(/^01\d{9}$/)
        .withMessage('নমিনির ফোন নম্বরটি সঠিক নয়।'),
];
exports.validateCreateSeller = [
    (0, express_validator_1.body)('phoneNo')
        .trim()
        .notEmpty()
        .withMessage('ফোন নম্বর প্রয়োজন।')
        .matches(/^01\d{9}$/)
        .withMessage('ফোন নম্বরটি সঠিক নয়।'),
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ max: 48 })
        .withMessage('নামটি আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('password')
        .trim()
        .notEmpty()
        .withMessage('পাসওয়ার্ড প্রয়োজন।')
        .isLength({ min: 6 })
        .withMessage('পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।')
        .isLength({ max: 16 })
        .withMessage('পাসওয়ার্ডটি আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('email').optional().trim().isEmail().withMessage('ইমেইলটি সঠিক নয়।'),
    (0, express_validator_1.body)('shopName')
        .trim()
        .notEmpty()
        .withMessage('দোকানের নাম প্রয়োজন।')
        .isLength({ max: 32 })
        .withMessage('দোকানের নাম আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('zilla')
        .trim()
        .notEmpty()
        .withMessage('জেলার নাম প্রয়োজন।')
        .isLength({ max: 48 })
        .withMessage('জেলার নাম আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('upazilla')
        .trim()
        .notEmpty()
        .withMessage('উপজেলার নাম প্রয়োজন।')
        .isLength({ max: 48 })
        .withMessage('উপজেলার নাম আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('address')
        .trim()
        .notEmpty()
        .withMessage('ঠিকানা প্রয়োজন।')
        .isLength({ max: 255 })
        .withMessage('ঠিকানা আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('nomineePhone')
        .optional()
        .trim()
        .matches(/^01\d{9}$/)
        .withMessage('নমিনির ফোন নম্বরটি সঠিক নয়।'),
    (0, express_validator_1.body)('referralCode')
        .optional()
        .trim()
        .matches(/^[a-zA-Z0-9-_]+$/)
        .withMessage('রেফারাল কোডটি শুধুমাত্র অক্ষর, সংখ্যা, (-) এবং (_) থাকতে পারে।')
        .isLength({ max: 16, min: 3 })
        .withMessage('রেফারাল কোডটি ৩ থেকে ১৬ অক্ষরের মধ্যে হতে হবে।'),
];
// Validator for `loginWithPhoneNoAndPassword`
exports.validateLoginWithPhoneNoAndPassword = [
    (0, express_validator_1.body)('phoneNo')
        .trim()
        .notEmpty()
        .withMessage('ফোন নম্বর প্রয়োজন।')
        .matches(/^01\d{9}$/)
        .withMessage('ফোন নম্বরটি সঠিক নয়।'),
    (0, express_validator_1.body)('password')
        .trim()
        .notEmpty()
        .withMessage('পাসওয়ার্ড প্রয়োজন।')
        .isLength({ min: 6 })
        .withMessage('পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।')
        .isLength({ max: 16 })
        .withMessage('পাসওয়ার্ডটি আরও ছোট হতে হবে।'),
];
// Validator for `sendOtp`
exports.validateSendOtp = [
    (0, express_validator_1.body)('phoneNo')
        .trim()
        .notEmpty()
        .withMessage('ফোন নম্বর প্রয়োজন।')
        .matches(/^01\d{9}$/)
        .withMessage('ফোন নম্বরটি সঠিক নয়।'),
];
// Validator for `verifyOtp`
exports.validateVerifyOtp = [
    (0, express_validator_1.body)('phoneNo')
        .trim()
        .notEmpty()
        .withMessage('ফোন নম্বর প্রয়োজন।')
        .matches(/^01\d{9}$/)
        .withMessage('ফোন নম্বরটি সঠিক নয়।'),
    (0, express_validator_1.body)('otp')
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP ৬ অক্ষরের হতে হবে।'),
];
// Validator for `updateProfile`
exports.validateUpdateProfile = [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ max: 48 })
        .withMessage('নামটি আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('email').optional().trim().isEmail().withMessage('ইমেইলটি সঠিক নয়।'),
    (0, express_validator_1.body)('address')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('ঠিকানা আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('nomineePhone')
        .optional()
        .trim()
        .matches(/^01\d{9}$/)
        .withMessage('নমিনির ফোন নম্বরটি সঠিক নয়।'),
    (0, express_validator_1.body)('zilla')
        .optional()
        .trim()
        .isLength({ max: 48 })
        .withMessage('জেলার নাম আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('upazilla')
        .optional()
        .trim()
        .isLength({ max: 48 })
        .withMessage('উপজেলার নাম আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('shopName')
        .optional()
        .trim()
        .isLength({ max: 32 })
        .withMessage('দোকানের নাম আরও ছোট হতে হবে।'),
];
// Validator for `updatePassword`
exports.validateChangePassword = [
    (0, express_validator_1.body)('currentPassword')
        .trim()
        .notEmpty()
        .withMessage('বর্তমান পাসওয়ার্ড প্রয়োজন।'),
    (0, express_validator_1.body)('newPassword')
        .trim()
        .isLength({ min: 6 })
        .withMessage('নতুন পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।')
        .isLength({ max: 16 })
        .withMessage('নতুন পাসওয়ার্ডটি আরও ছোট হতে হবে।'),
];
// Validator for `addReferralCode`
exports.validateAddReferralCode = [
    (0, express_validator_1.body)('referralCode')
        .trim()
        .notEmpty()
        .withMessage('রেফারাল কোড প্রয়োজন।')
        .isLength({ max: 32 })
        .withMessage('রেফারাল কোড আরও ছোট হতে হবে।'),
];
// Validator for `getUserByPhoneNo`
exports.validateGetUserByPhoneNo = [
    (0, express_validator_1.param)('phoneNo')
        .trim()
        .notEmpty()
        .withMessage('ফোন নম্বর প্রয়োজন।')
        .matches(/^01\d{9}$/)
        .withMessage('ফোন নম্বরটি সঠিক নয়।'),
];
// Validator for `getAllUsers`
exports.validateGetAllUsers = [
    (0, express_validator_1.query)('phoneNo')
        .optional()
        .trim()
        .matches(/^01\d{9}$/)
        .withMessage('ফোন নম্বরটি সঠিক নয়।'),
    (0, express_validator_1.query)('name')
        .optional()
        .trim()
        .isLength({ max: 48 })
        .withMessage('নামটি আরও ছোট হতে হবে।'),
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('পৃষ্ঠা নম্বর সঠিক নয়।'),
    (0, express_validator_1.query)('pageSize')
        .optional()
        .isInt({ min: 1 })
        .withMessage('পৃষ্ঠা আকার সঠিক নয়।'),
];
// Validator for `forgotPassword`
exports.validateForgotPassword = [
    (0, express_validator_1.body)('phoneNo')
        .trim()
        .notEmpty()
        .withMessage('ফোন নম্বর প্রয়োজন।')
        .matches(/^01\d{9}$/)
        .withMessage('ফোন নম্বরটি সঠিক নয়।'),
];
