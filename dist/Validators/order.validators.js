"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateOrder = void 0;
const express_validator_1 = require("express-validator");
exports.validateCreateOrder = [
    (0, express_validator_1.body)('customerName')
        .trim()
        .notEmpty()
        .withMessage('গ্রাহকের নাম প্রয়োজন।')
        .isLength({ max: 48 })
        .withMessage('গ্রাহকের নাম আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('customerPhoneNo')
        .trim()
        .notEmpty()
        .withMessage('গ্রাহকের ফোন নম্বর প্রয়োজন।')
        .matches(/^01\d{9}$/)
        .withMessage('গ্রাহকের ফোন নম্বরটি সঠিক নয়।'),
    (0, express_validator_1.body)('customerZilla')
        .trim()
        .notEmpty()
        .withMessage('গ্রাহকের জেলা প্রয়োজন।')
        .isLength({ max: 48 })
        .withMessage('গ্রাহকের জেলার নাম আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('customerUpazilla')
        .trim()
        .notEmpty()
        .withMessage('গ্রাহকের উপজেলা প্রয়োজন।')
        .isLength({ max: 48 })
        .withMessage('গ্রাহকের উপজেলার নাম আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('deliveryAddress')
        .trim()
        .notEmpty()
        .withMessage('ডেলিভারি ঠিকানা প্রয়োজন।')
        .isLength({ max: 255 })
        .withMessage('ডেলিভারি ঠিকানা আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('comments')
        .optional()
        .trim()
        .isLength({ max: 512 })
        .withMessage('মন্তব্য আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('products')
        .isArray({ min: 1 })
        .withMessage('অন্তত একটি পণ্য প্রয়োজন।'),
    (0, express_validator_1.body)('products.*.productId')
        .isInt({ min: 1 })
        .withMessage('পণ্য আইডি সঠিক নয়।'),
    (0, express_validator_1.body)('products.*.productQuantity')
        .isInt({ min: 1 })
        .withMessage('পণ্যের পরিমাণ সঠিক নয়।'),
    (0, express_validator_1.body)('products.*.productImage')
        .trim()
        .notEmpty()
        .withMessage('পণ্যের ছবি প্রয়োজন।')
        .isURL()
        .withMessage('পণ্যের ছবির URL সঠিক নয়।'),
    (0, express_validator_1.body)('products.*.productSellingPrice')
        .isFloat({ min: 0 })
        .withMessage('পণ্যের বিক্রয় মূল্য সঠিক নয়।'),
    (0, express_validator_1.body)('products.*.selectedOptions')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('নির্বাচিত অপশনগুলি আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('isDeliveryChargePaidBySeller')
        .isBoolean()
        .withMessage('ডেলিভারি চার্জ প্রদানের তথ্য সঠিক নয়।'),
    (0, express_validator_1.body)('deliveryChargePaidBySeller')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('প্রদত্ত ডেলিভারি চার্জ সঠিক নয়।'),
    // Conditional validations for seller-paid delivery
    (0, express_validator_1.check)('transactionId')
        .if((0, express_validator_1.body)('isDeliveryChargePaidBySeller').equals('true'))
        .trim()
        .notEmpty()
        .withMessage('ডেলিভারি চার্জ বিক্রেতা প্রদান করলে লেনদেন আইডি প্রয়োজন।')
        .isLength({ max: 64 })
        .withMessage('লেনদেন আইডি আরও ছোট হতে হবে।')
        .optional(),
    (0, express_validator_1.check)('adminWalletId')
        .if((0, express_validator_1.body)('isDeliveryChargePaidBySeller').equals('true'))
        .isInt({ min: 1 })
        .withMessage('ডেলিভারি চার্জ বিক্রেতা প্রদান করলে অ্যাডমিন ওয়ালেট আইডি প্রয়োজন।')
        .optional(),
    (0, express_validator_1.body)('sellerWalletName')
        .if((0, express_validator_1.body)('isDeliveryChargePaidBySeller').equals('true'))
        .trim()
        .notEmpty()
        .withMessage('বিক্রেতার ওয়ালেট নাম প্রয়োজন।'),
    (0, express_validator_1.body)('sellerWalletPhoneNo')
        .if((0, express_validator_1.body)('isDeliveryChargePaidBySeller').equals('true'))
        .trim()
        .notEmpty()
        .withMessage('বিক্রেতার ফোন নম্বর প্রয়োজন।')
        .matches(/^01\d{9}$/)
        .withMessage('বিক্রেতার ফোন নম্বর সঠিক নয়।'),
];
