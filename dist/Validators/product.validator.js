"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImageValidator = exports.productIdValidatorParams = exports.updateProductMetaValidator = exports.addProductMetaValidator = exports.addReviewValidator = exports.removeQuantitiesValidator = exports.addImagesValidator = exports.updateProductValidator = exports.createProductValidator = void 0;
const express_validator_1 = require("express-validator");
// Validator for creating a new product
const createProductValidator = () => [
    (0, express_validator_1.body)('name').isString().notEmpty().withMessage('নাম দেওয়া বাধ্যতামূলক।'),
    (0, express_validator_1.body)('imageUrl').isURL().withMessage('ছবির ইউআরএল সঠিক হতে হবে।'),
    // category is optional because it can be added later and upto 48 characters
    (0, express_validator_1.body)('category')
        .optional()
        .isString()
        .isLength({ max: 48 })
        .withMessage('category আরও ছোট হতে হবে।'),
    ,
    (0, express_validator_1.body)('basePrice').isFloat({ gt: 0 }).withMessage('মূল্য সঠিক হতে হবে।'),
    // stockSize is optional because it can be added later and must be greater than 0 and default to 0
    (0, express_validator_1.body)('stockSize')
        .optional()
        .isInt({ gt: -1 })
        .withMessage('স্টক সাইজ অবশ্যই সঠিক হতে হবে।'),
    // suggestedMaxPrice is optional because it can be added later and must be greater than 0 and must be greater or equal to basePrice
    (0, express_validator_1.body)('suggestedMaxPrice')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('প্রস্তাবিত সর্বোচ্চ মূল্য সঠিক হতে হবে।')
        .custom((value, { req }) => {
        if (value < req.body.basePrice) {
            throw new Error('প্রস্তাবিত সর্বোচ্চ মূল্য, base price  চেয়ে বড় হতে হবে।');
        }
        return true;
    }),
    // description is f maximum 512 characters
    (0, express_validator_1.body)('description')
        .isString()
        .optional()
        .isLength({ max: 512 })
        .withMessage('বিবরণ আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('location').isString().withMessage('লোকেশন সঠিক হতে হবে।'),
    (0, express_validator_1.body)('deliveryChargeInside')
        .isInt({ gt: -1 })
        .withMessage('inside ডেলিভারি চার্জ সঠিক হতে হবে।'),
    (0, express_validator_1.body)('deliveryChargeOutside')
        .isInt({ gt: -1 })
        .withMessage('outside ডেলিভারি চার্জ সঠিক হতে হবে।'),
    (0, express_validator_1.body)('videoUrl').optional().isURL().withMessage('ভিডিও ইউআরএল সঠিক হতে হবে।'),
];
exports.createProductValidator = createProductValidator;
// Validator for updating a product
const updateProductValidator = () => [
    (0, express_validator_1.param)('productId').isInt().withMessage('product id একটি সঠিক  হতে হবে।'),
    (0, express_validator_1.body)('name')
        .optional()
        .isString()
        .isLength({ max: 128 })
        .withMessage('নাম আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('imageUrl').optional().isURL().withMessage('ছবির ইউআরএল সঠিক হতে হবে।'),
    (0, express_validator_1.body)('category').optional().isString(),
    (0, express_validator_1.body)('basePrice')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('মূল্য সঠিক হতে হবে।'),
    (0, express_validator_1.body)('stockSize')
        .optional()
        .isInt({ gt: -1 })
        .withMessage('স্টক সাইজ অবশ্যই সঠিক হতে হবে।'),
    // suggestedMaxPrice is optional because it can be added later and must be greater than 0 and must be greater or equal to basePrice
    (0, express_validator_1.body)('suggestedMaxPrice')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('প্রস্তাবিত সর্বোচ্চ মূল্য সঠিক হতে হবে।')
        .custom((value, { req }) => {
        if (value < req.body.basePrice) {
            throw new Error('প্রস্তাবিত সর্বোচ্চ মূল্য, base price  চেয়ে বড় হতে হবে।');
        }
        return true;
    }),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .isLength({ max: 512 })
        .withMessage('বিবরণ আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('location')
        .optional()
        .isString()
        .isLength({ max: 128 })
        .withMessage('লোকেশন আরও ছোট হতে হবে।'),
    (0, express_validator_1.body)('deliveryChargeInside')
        .isInt({ gt: -1 })
        .withMessage('inside ডেলিভারি চার্জ সঠিক হতে হবে।'),
    (0, express_validator_1.body)('deliveryChargeOutside')
        .isInt({ gt: -1 })
        .withMessage('outside ডেলিভারি চার্জ সঠিক হতে হবে।'),
    (0, express_validator_1.body)('videoUrl').optional().isURL().withMessage('ভিডিও ইউআরএল সঠিক হতে হবে।'),
];
exports.updateProductValidator = updateProductValidator;
// Validator for adding product images
const addImagesValidator = () => [
    (0, express_validator_1.param)('productId').isInt().withMessage('product id সঠিক  হতে হবে।'),
    (0, express_validator_1.body)('images')
        .isArray()
        .withMessage('চিত্রগুলি একটি অ্যারে হতে হবে।')
        .notEmpty()
        .withMessage('অন্তত একটি ছবি অবশ্যই প্রেরণ করতে হবে।'),
    (0, express_validator_1.body)('images.*').isURL().withMessage('প্রতিটি ছবি সঠিক ইউআরএল হতে হবে।'),
];
exports.addImagesValidator = addImagesValidator;
// Validator for removing product quantities
const removeQuantitiesValidator = () => [
    (0, express_validator_1.param)('productId').isInt().withMessage('product id সঠিক  হতে হবে।'),
    (0, express_validator_1.body)('quantity')
        .isInt({ gt: 0 })
        .withMessage('কমানোর পরিমাণ ০ এর বেশি হতে হবে।'),
];
exports.removeQuantitiesValidator = removeQuantitiesValidator;
// Validator for adding product review
const addReviewValidator = () => [
    (0, express_validator_1.param)('productId').isInt().withMessage('product id সঠিক হতে হবে।'),
    //rating is optional because it can be added later and must be between 1 and 5
    (0, express_validator_1.body)('rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('রেটিং অবশ্যই ১ এবং ৫ এর মধ্যে হতে হবে।'),
    (0, express_validator_1.body)('comment')
        .optional()
        .isString()
        .isLength({ max: 512 })
        .withMessage('মন্তব্য আরও ছোট হতে হবে।'),
];
exports.addReviewValidator = addReviewValidator;
// Validator for adding product meta information
const addProductMetaValidator = () => [
    (0, express_validator_1.param)('productId').isInt().withMessage('product id সঠিক হতে হবে।'),
    (0, express_validator_1.body)('meta').isArray().withMessage('মেটা তথ্য সঠিক হতে হবে।'),
    (0, express_validator_1.body)('meta.*.key').isString().withMessage('মেটা সঠিক হতে হবে।'),
    (0, express_validator_1.body)('meta.*.value').isString().withMessage('মেটা সঠিক হতে হবে।'),
];
exports.addProductMetaValidator = addProductMetaValidator;
// Validator for updating product meta information
const updateProductMetaValidator = () => [
    (0, express_validator_1.param)('productId').isInt().withMessage('product id সঠিক হতে হবে।'),
    (0, express_validator_1.body)('meta').isArray().withMessage('মেটা তথ্য সঠিক হতে হবে।'),
    (0, express_validator_1.body)('meta.*.key').isString().withMessage('মেটা সঠিক হতে হবে।'),
    (0, express_validator_1.body)('meta.*.value').isString().withMessage('মেটা সঠিক হতে হবে।'),
];
exports.updateProductMetaValidator = updateProductMetaValidator;
// product id in param validation
const productIdValidatorParams = () => [
    (0, express_validator_1.param)('productId').isInt().withMessage('product id সঠিক হতে হবে।'),
];
exports.productIdValidatorParams = productIdValidatorParams;
const deleteImageValidator = () => [
    (0, express_validator_1.param)('productId').isInt().withMessage('product id সঠিক হতে হবে।'),
    (0, express_validator_1.body)('imageId').isInt().withMessage('image id সঠিক হতে হবে।'),
];
exports.deleteImageValidator = deleteImageValidator;
