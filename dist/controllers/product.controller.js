"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_services_1 = __importDefault(require("../services/product.services"));
const user_services_1 = __importDefault(require("../services/user.services"));
class ProductController {
    /**
     * Create a new product
     */
    createProduct(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const productData = req.body;
                const newProduct = yield product_services_1.default.createProduct(productData);
                res.status(201).json({
                    statusCode: 201,
                    message: 'পণ্য সফলভাবে তৈরি হয়েছে',
                    success: true,
                    data: newProduct,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Update product details
     */
    updateProduct(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const updates = req.body;
                const updatedProduct = yield product_services_1.default.updateProduct(Object.assign({ productId: +productId }, updates));
                res.status(200).json({
                    statusCode: 200,
                    message: 'পণ্য সফলভাবে আপডেট করা হয়েছে',
                    success: true,
                    data: updatedProduct,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Add images for a product
     */
    addImages(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const { images } = req.body; // Assume `images` is an array of URLs or image IDs
                const updatedProduct = yield product_services_1.default.addProductImages(Number(productId), images);
                res.status(200).json({
                    statusCode: 200,
                    message: 'পণ্যের ছবি সফলভাবে যোগ করা হয়েছে',
                    success: true,
                    data: updatedProduct,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Remove some quantities from a product
     */
    removeQuantities(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const { quantity } = req.body;
                const updatedProduct = yield product_services_1.default.removeProductQuantity(Number(productId), quantity);
                res.status(200).json({
                    statusCode: 200,
                    message: 'পণ্যের পরিমাণ সফলভাবে কমানো হয়েছে',
                    success: true,
                    data: updatedProduct,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Publish a product
     */
    publishProduct(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const publishedProduct = yield product_services_1.default.publishProduct(+productId);
                res.status(200).json({
                    statusCode: 200,
                    message: 'পণ্য সফলভাবে প্রকাশিত হয়েছে',
                    success: true,
                    data: publishedProduct,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Add product meta information
     */
    addProductMeta(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const { meta } = req.body;
                console.log(meta);
                const updatedProduct = yield product_services_1.default.addProductMeta(+productId, meta);
                res.status(200).json({
                    statusCode: 200,
                    message: 'পণ্যের মেটা তথ্য সফলভাবে যোগ করা হয়েছে',
                    success: true,
                    data: updatedProduct,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Update product meta information
     */
    updateProductMeta(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const { meta } = req.body;
                const updatedProduct = yield product_services_1.default.updateProductMeta(+productId, meta);
                res.status(200).json({
                    statusCode: 200,
                    message: 'পণ্যের মেটা তথ্য সফলভাবে আপডেট করা হয়েছে',
                    success: true,
                    data: updatedProduct,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Add product review
     */
    addReview(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                //get user info
                const { userId: sellerId, name: sellerName, phoneNo: sellerPhone, } = yield user_services_1.default.getUserByUserId(userId);
                const { rating, comment } = req.body;
                const updatedProduct = yield product_services_1.default.addProductReview({
                    sellerId,
                    sellerName,
                    sellerPhone,
                    rating,
                    review: comment,
                    productId: +productId,
                });
                res.status(200).json({
                    statusCode: 200,
                    message: 'পণ্যের রিভিউ সফলভাবে যোগ করা হয়েছে',
                    success: true,
                    data: updatedProduct,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteImage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId, imageId } = req.params;
                const updatedProduct = yield product_services_1.default.deleteImage(+productId, +imageId);
                res.status(200).json({
                    statusCode: 200,
                    message: 'ছবি সফলভাবে মুছে ফেলা হয়েছে',
                    success: true,
                    data: updatedProduct,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllProducts(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, category, minPrice, maxPrice, page, pageSize } = req.query;
                // Prepare filters with proper types
                const filters = {
                    name: name,
                    category: category,
                    minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
                    maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
                    page: page ? parseInt(page, 10) : undefined,
                    pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
                };
                // Call the service
                const result = yield product_services_1.default.getAllProducts(filters, ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) == 'Admin' ? undefined : true);
                res.status(200).json({
                    statusCode: 200,
                    message: 'সকল পণ্যের তালিকা',
                    success: true,
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getProduct(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const role = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.role;
                const product = yield product_services_1.default.getProduct(+productId);
                if (!role || role == 'Seller') {
                    product.stockSize = product.stockSize > 0 ? 1 : 0;
                }
                res.status(200).json({
                    statusCode: 200,
                    message: 'পণ্য সফলভাবে পেয়েছেন',
                    success: true,
                    data: product,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new ProductController();
