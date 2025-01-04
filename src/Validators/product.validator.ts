import { body, param } from 'express-validator'

// Validator for creating a new product
export const createProductValidator = () => [
  body('name').isString().notEmpty().withMessage('নাম দেওয়া বাধ্যতামূলক।'),
  body('imageUrl').isURL().withMessage('ছবির ইউআরএল সঠিক হতে হবে।'),
  // category is optional because it can be added later and upto 48 characters
  body('category')
    .optional()
    .isString()
    .isLength({ max: 48 })
    .withMessage('category আরও ছোট হতে হবে।'),

  ,
  body('basePrice').isFloat({ gt: 0 }).withMessage('মূল্য সঠিক হতে হবে।'),
  // stockSize is optional because it can be added later and must be greater than 0 and default to 0
  body('stockSize')
    .optional()
    .isInt({ gt: -1 })
    .withMessage('স্টক সাইজ অবশ্যই সঠিক হতে হবে।'),
  // suggestedMaxPrice is optional because it can be added later and must be greater than 0 and must be greater or equal to basePrice
  body('suggestedMaxPrice')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('প্রস্তাবিত সর্বোচ্চ মূল্য সঠিক হতে হবে।')
    .custom((value, { req }) => {
      if (value < req.body.basePrice) {
        throw new Error(
          'প্রস্তাবিত সর্বোচ্চ মূল্য, base price  চেয়ে বড় হতে হবে।',
        )
      }
      return true
    }),
  // description is f maximum 512 characters

  body('description')
    .isString()
    .optional()
    .isLength({ max: 512 })
    .withMessage('বিবরণ আরও ছোট হতে হবে।'),
  body('location').isString().withMessage('লোকেশন সঠিক হতে হবে।'),
  body('deliveryChargeInside')
    .isInt({ gt: -1 })
    .withMessage('inside ডেলিভারি চার্জ সঠিক হতে হবে।'),
  body('deliveryChargeOutside')
    .isInt({ gt: -1 })
    .withMessage('outside ডেলিভারি চার্জ সঠিক হতে হবে।'),
  body('videoUrl').optional().isURL().withMessage('ভিডিও ইউআরএল সঠিক হতে হবে।'),
]

// Validator for updating a product
export const updateProductValidator = () => [
  param('productId').isInt().withMessage('product id একটি সঠিক  হতে হবে।'),
  body('name')
    .optional()
    .isString()
    .isLength({ max: 128 })
    .withMessage('নাম আরও ছোট হতে হবে।'),
  body('imageUrl').optional().isURL().withMessage('ছবির ইউআরএল সঠিক হতে হবে।'),
  body('category').optional().isString(),
  body('basePrice')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('মূল্য সঠিক হতে হবে।'),
  body('stockSize')
    .optional()
    .isInt({ gt: -1 })
    .withMessage('স্টক সাইজ অবশ্যই সঠিক হতে হবে।'),
  // suggestedMaxPrice is optional because it can be added later and must be greater than 0 and must be greater or equal to basePrice
  body('suggestedMaxPrice')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('প্রস্তাবিত সর্বোচ্চ মূল্য সঠিক হতে হবে।')
    .custom((value, { req }) => {
      if (value < req.body.basePrice) {
        throw new Error(
          'প্রস্তাবিত সর্বোচ্চ মূল্য, base price  চেয়ে বড় হতে হবে।',
        )
      }
      return true
    }),

  body('description')
    .optional()
    .isString()
    .isLength({ max: 512 })
    .withMessage('বিবরণ আরও ছোট হতে হবে।'),
  body('location')
    .optional()
    .isString()
    .isLength({ max: 128 })
    .withMessage('লোকেশন আরও ছোট হতে হবে।'),
  body('deliveryChargeInside')
    .isInt({ gt: -1 })
    .withMessage('inside ডেলিভারি চার্জ সঠিক হতে হবে।'),
  body('deliveryChargeOutside')
    .isInt({ gt: -1 })
    .withMessage('outside ডেলিভারি চার্জ সঠিক হতে হবে।'),
  body('videoUrl').optional().isURL().withMessage('ভিডিও ইউআরএল সঠিক হতে হবে।'),
]

// Validator for adding product images
export const addImagesValidator = () => [
  param('productId').isInt().withMessage('product id সঠিক  হতে হবে।'),
  body('images')
    .isArray()
    .withMessage('চিত্রগুলি একটি অ্যারে হতে হবে।')
    .notEmpty()
    .withMessage('অন্তত একটি ছবি অবশ্যই প্রেরণ করতে হবে।'),
  body('images.*').isURL().withMessage('প্রতিটি ছবি সঠিক ইউআরএল হতে হবে।'),
]

// Validator for removing product quantities
export const removeQuantitiesValidator = () => [
  param('productId').isInt().withMessage('product id সঠিক  হতে হবে।'),
  body('quantity')
    .isInt({ gt: 0 })
    .withMessage('কমানোর পরিমাণ ০ এর বেশি হতে হবে।'),
]

// Validator for adding product review
export const addReviewValidator = () => [
  param('productId').isInt().withMessage('product id সঠিক হতে হবে।'),
  //rating is optional because it can be added later and must be between 1 and 5
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('রেটিং অবশ্যই ১ এবং ৫ এর মধ্যে হতে হবে।'),
  body('comment')
    .optional()
    .isString()
    .isLength({ max: 512 })
    .withMessage('মন্তব্য আরও ছোট হতে হবে।'),
]

// Validator for adding product meta information
export const addProductMetaValidator = () => [
  param('productId').isInt().withMessage('product id সঠিক হতে হবে।'),
  body('meta').isArray().withMessage('মেটা তথ্য সঠিক হতে হবে।'),
  body('meta.*.key').isString().withMessage('মেটা সঠিক হতে হবে।'),
  body('meta.*.value').isString().withMessage('মেটা সঠিক হতে হবে।'),
]

// Validator for updating product meta information
export const updateProductMetaValidator = () => [
  param('productId').isInt().withMessage('product id সঠিক হতে হবে।'),
  body('meta').isArray().withMessage('মেটা তথ্য সঠিক হতে হবে।'),
  body('meta.*.key').isString().withMessage('মেটা সঠিক হতে হবে।'),
  body('meta.*.value').isString().withMessage('মেটা সঠিক হতে হবে।'),
]
// product id in param validation
export const productIdValidatorParams = () => [
  param('productId').isInt().withMessage('product id সঠিক হতে হবে।'),
]
export const deleteImageValidator = () => [
  param('productId').isInt().withMessage('product id সঠিক হতে হবে।'),
  body('imageId').isInt().withMessage('image id সঠিক হতে হবে।'),
]
