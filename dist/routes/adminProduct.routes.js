"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = __importDefault(require("../controllers/product.controller"));
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const product_validator_1 = require("../Validators/product.validator");
const productRouter = (0, express_1.Router)();
productRouter.post('/', product_controller_1.default.createProduct);
productRouter.get('/', product_controller_1.default.getAllProducts);
productRouter.get('/:productId', product_validator_1.productIdValidatorParams, validation_middleware_1.default, product_controller_1.default.getProduct);
productRouter.patch('/:productId', 
// updateProductValidator,
// validateRequest,
product_controller_1.default.updateProduct);
productRouter.post('/:productId/images', 
// addImagesValidator,
// validateRequest,
product_controller_1.default.addImages);
productRouter.get('/:productId/images', product_controller_1.default.getProductImages);
productRouter.post('/:productId/publish', 
// productIdValidatorParams,
// validateRequest,
product_controller_1.default.publishProduct);
productRouter.post('/:productId/unpublish', 
// productIdValidatorParams,
// validateRequest,
product_controller_1.default.unpublishProduct);
productRouter.put('/:productId/meta', 
// addProductMetaValidator,
// validateRequest,
product_controller_1.default.createOrUpdateProductMeta);
productRouter.get('/:productId/meta', 
// productIdValidatorParams,
// validateRequest,
product_controller_1.default.getProductMeta);
productRouter.patch('/:productId/info', product_validator_1.updateProductMetaValidator, validation_middleware_1.default, product_controller_1.default.updateProductMeta);
productRouter.post('/:productId/review', product_validator_1.addReviewValidator, validation_middleware_1.default, product_controller_1.default.addReview);
productRouter.delete('/:productId/images/:imageId', 
// deleteImageValidator,
// validateRequest,
product_controller_1.default.deleteImage);
exports.default = productRouter;
