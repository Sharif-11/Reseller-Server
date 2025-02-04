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
const ApiError_1 = __importDefault(require("../utils/ApiError")); // Importing your custom ApiError
const prisma_1 = __importDefault(require("../utils/prisma"));
class ProductImageService {
    /**
     * Add multiple images for a product
     * @param productId - ID of the product
     * @param imageUrls - Array of image URLs to be added
     */
    addImages(productId, imageUrls) {
        return __awaiter(this, void 0, void 0, function* () {
            const imageEntries = imageUrls.map(url => ({
                productId,
                imageUrl: url,
            }));
            try {
                const result = yield prisma_1.default.productImage.createMany({
                    data: imageEntries,
                });
                return result;
            }
            catch (error) {
                throw new ApiError_1.default(500, 'ছবি আপলোড করতে ব্যর্থ। আবার চেষ্টা করুন।');
            }
        });
    }
    /**
     * Delete a specific image of a specific product
     * @param productId - ID of the product
     * @param imageId - ID of the image to delete
     */
    deleteImage(imageId) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log({ productId, imageId })
            try {
                return yield prisma_1.default.productImage.delete({
                    where: {
                        imageId,
                    },
                });
            }
            catch (error) {
                console.log(error);
                throw new ApiError_1.default(500, 'ছবি মুছতে ব্যর্থ। আবার চেষ্টা করুন।');
            }
        });
    }
    /**
     * Delete all images related to a product
     * @param productId - ID of the product
     */
    deleteAllImages(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma_1.default.productImage.deleteMany({
                    where: {
                        productId,
                    },
                });
            }
            catch (error) {
                throw new ApiError_1.default(500, 'সব ছবি মুছতে ব্যর্থ। আবার চেষ্টা করুন।');
            }
        });
    }
}
class ProductMetaService {
    // Method to add new meta information
    addMeta(productId, metaEntries) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newMetaData = metaEntries.map(entry => ({
                    productId,
                    key: entry.key,
                    value: entry.value,
                }));
                yield prisma_1.default.productMeta.createMany({
                    data: newMetaData,
                });
            }
            catch (error) {
                throw new ApiError_1.default(500, 'মেটা ডেটা যোগ করতে ব্যর্থ। আবার চেষ্টা করুন।');
            }
        });
    }
}
class ProductReviewService {
    /**
     * Add a review by a seller for a product
     * @param productId - ID of the product
     * @param sellerId - ID of the seller
     * @param review - Review text for the product
     * @param rating - Rating for the product (e.g., 1 to 5)
     * @param sellerPhone - Seller's phone number
     * @param sellerName - Seller's name
     */
    addReview(productId, sellerId, review, rating, sellerPhone, sellerName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!review || review.trim() === '') {
                throw new ApiError_1.default(400, 'রিভিউ লেখাটি খালি হতে পারে না।');
            }
            if (rating < 1 || rating > 5) {
                throw new ApiError_1.default(400, 'রেটিং ১ থেকে ৫ এর মধ্যে হতে হবে।');
            }
            try {
                // Create a new review entry in the database
                const result = yield prisma_1.default.productReview.create({
                    data: {
                        productId,
                        sellerId,
                        review,
                        rating,
                        sellerPhone,
                        sellerName,
                    },
                });
                return result;
            }
            catch (error) {
                throw new ApiError_1.default(500, 'রিভিউ যোগ করতে ব্যর্থ। আবার চেষ্টা করুন।');
            }
        });
    }
}
// Assuming you have your custom error handler
class ProductService {
    constructor() {
        this.imageService = new ProductImageService();
        this.metaService = new ProductMetaService();
        this.reviewService = new ProductReviewService();
    }
    /**
     * Create a new product
     * @param data - Object containing product details
     */
    createProduct(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, imageUrl, category, basePrice, stockSize, suggestedMaxPrice, description, location, deliveryChargeInside, deliveryChargeOutside, videoUrl, } = data;
            try {
                const newProduct = yield prisma_1.default.product.create({
                    data: {
                        name,
                        imageUrl,
                        category,
                        basePrice,
                        stockSize: Number(stockSize) || 0,
                        suggestedMaxPrice,
                        videoUrl,
                        location,
                        deliveryChargeInside,
                        deliveryChargeOutside,
                        isVerifiedProduct: false,
                        published: false,
                        description,
                    },
                });
                return newProduct;
            }
            catch (error) {
                console.error('Error creating product:', error);
                throw new ApiError_1.default(500, 'পণ্য তৈরি করতে ব্যর্থ। আবার চেষ্টা করুন।');
            }
        });
    }
    /**
     * Get a product by ID, including images and metas
     * @param productId - ID of the product to retrieve
     */
    getProduct(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield prisma_1.default.product.findUnique({
                    where: { productId },
                    include: {
                        images: {
                            select: {
                                imageId: true,
                                imageUrl: true,
                            },
                        },
                        metas: {
                            select: {
                                key: true,
                                value: true,
                            },
                        },
                    },
                });
                if (!product) {
                    throw new ApiError_1.default(404, 'পণ্য পাওয়া যায়নি।');
                }
                return product;
            }
            catch (error) {
                console.error('Error retrieving product:', error);
                throw new ApiError_1.default(500, 'পণ্য লোড করতে ব্যর্থ। আবার চেষ্টা করুন।');
            }
        });
    }
    getAllProducts(filters, isPublished) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, category, minPrice, maxPrice, page, pageSize } = filters;
            const where = {};
            // Add optional 'published' filter
            if (isPublished !== undefined) {
                where.published = isPublished; // Filter by published status if specified
            }
            // Add filters for name and category
            if (name) {
                where.name = {
                    startsWith: name,
                    mode: 'insensitive', // Case-insensitive prefix match
                };
            }
            if (category) {
                where.category = {
                    startsWith: category,
                    mode: 'insensitive', // Case-insensitive prefix match
                };
            }
            // Add price range filter
            if (minPrice !== undefined || maxPrice !== undefined) {
                where.basePrice = Object.assign(Object.assign({}, (minPrice !== undefined ? { gte: minPrice } : {})), (maxPrice !== undefined ? { lte: maxPrice } : {}));
            }
            // Pagination is optional
            let skip, take;
            if (page && pageSize) {
                skip = (page - 1) * pageSize;
                take = pageSize;
            }
            // Fetch data
            const products = yield prisma_1.default.product.findMany(Object.assign({ where, select: {
                    name: true,
                    imageUrl: true,
                    basePrice: true,
                }, orderBy: {
                    createdAt: 'desc', // Most recently added at the top
                } }, (skip !== undefined && take !== undefined ? { skip, take } : {})));
            // Total count for pagination (only calculated if pagination is used)
            const totalProducts = page && pageSize ? yield prisma_1.default.product.count({ where }) : undefined;
            return Object.assign({ products }, (totalProducts !== undefined && page && pageSize
                ? {
                    totalProducts,
                    currentPage: page,
                    totalPages: Math.ceil(totalProducts / pageSize),
                }
                : {}));
        });
    }
    /**
     * Update an existing product (excluding the 'published' field)
     * @param data - Object containing updated product details
     */
    updateProduct(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { productId, name, imageUrl, category, basePrice, stockSize, suggestedMaximumPrice, description, location, insideDeliveryCharge, outsideDeliveryCharge, videoUrl, } = data;
            const existingProduct = yield prisma_1.default.product.findUnique({
                where: {
                    productId,
                },
            });
            if (!existingProduct) {
                throw new ApiError_1.default(404, 'পণ্য পাওয়া যায়নি।');
            }
            try {
                const updatedProduct = yield prisma_1.default.product.update({
                    where: {
                        productId,
                    },
                    data: {
                        name,
                        imageUrl,
                        category,
                        basePrice,
                        stockSize,
                        suggestedMaxPrice: suggestedMaximumPrice,
                        description,
                        videoUrl,
                        location,
                        deliveryChargeInside: insideDeliveryCharge,
                        deliveryChargeOutside: outsideDeliveryCharge,
                    },
                    include: {
                        images: true,
                        metas: true,
                    },
                });
                return updatedProduct;
            }
            catch (error) {
                console.error('Error updating product:', error);
                throw new ApiError_1.default(500, 'পণ্য আপডেট করতে ব্যর্থ। আবার চেষ্টা করুন।');
            }
        });
    }
    /**
     * Publish a product
     * @param productId - ID of the product to publish
     */
    publishProduct(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if the product exists
            const product = yield prisma_1.default.product.findUnique({
                where: { productId },
            });
            if (!product) {
                throw new ApiError_1.default(404, 'পণ্য পাওয়া যায়নি।');
            }
            try {
                // Update the product to set it as published
                const updatedProduct = yield prisma_1.default.product.update({
                    where: { productId },
                    data: { published: true },
                });
                return updatedProduct;
            }
            catch (error) {
                console.error('Error publishing product:', error);
                throw new ApiError_1.default(500, 'পণ্য প্রকাশ করতে ব্যর্থ। আবার চেষ্টা করুন।');
            }
        });
    }
    /**
     * Add a list of images to the product
     * @param productId - ID of the product to add images
     * @param imageUrls - List of image URLs to add
     */
    addProductImages(productId, imageUrls) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if the product exists
            const product = yield prisma_1.default.product.findUnique({
                where: { productId },
            });
            if (!product) {
                throw new ApiError_1.default(404, 'পণ্য পাওয়া যায়নি।');
            }
            yield this.imageService.addImages(productId, imageUrls);
            return this.getProduct(product.productId);
        });
    }
    /**
     * Remove a product by decreasing its stock size
     * @param productId - ID of the product
     * @param quantity - Quantity to decrease from the stock size
     */
    removeProductQuantity(productId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if the product exists
            const product = yield prisma_1.default.product.findUnique({
                where: { productId },
            });
            if (!product) {
                throw new ApiError_1.default(404, 'পণ্য পাওয়া যায়নি।');
            }
            if (product.stockSize < quantity) {
                throw new ApiError_1.default(400, 'স্টক সাইজ কমানো সম্ভব নয়। পর্যাপ্ত স্টক নেই।');
            }
            try {
                // Update the stock size by decreasing it
                const updatedProduct = yield prisma_1.default.product.update({
                    where: { productId },
                    data: {
                        stockSize: product.stockSize - quantity,
                    },
                });
                return updatedProduct;
            }
            catch (error) {
                console.error('Error updating product stock size:', error);
                throw new ApiError_1.default(500, 'পণ্য স্টক সাইজ কমাতে ব্যর্থ। আবার চেষ্টা করুন।');
            }
        });
    }
    /**
     * Add meta entries to a product
     * @param productId - ID of the product
     * @param metaEntries - List of meta entries to add
     */
    addProductMeta(productId, metaEntries) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if the product exists
            const product = yield prisma_1.default.product.findUnique({
                where: { productId },
            });
            if (!product) {
                throw new ApiError_1.default(404, 'পণ্য পাওয়া যায়নি।');
            }
            yield this.metaService.addMeta(productId, metaEntries);
            return this.getProduct(product.productId);
        });
    }
    /**
     * Add a review to a product
     * @param productId - ID of the product
     * @param sellerId - ID of the seller
     * @param review - Review text
     * @param rating - Rating for the product
     * @param sellerPhone - Seller's phone number
     * @param sellerName - Seller's name
     */
    addProductReview(reviewDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const { productId, sellerId, review, rating, sellerPhone, sellerName } = reviewDetails;
            const product = yield prisma_1.default.product.findUnique({
                where: { productId },
            });
            if (!product) {
                throw new ApiError_1.default(404, 'পণ্য পাওয়া যায়নি।');
            }
            //check seller id existence
            const seller = yield prisma_1.default.user.findUnique({
                where: { userId: sellerId },
            });
            if (!seller) {
                throw new ApiError_1.default(404, 'বিক্রেতা পাওয়া যায়নি।');
            }
            return this.reviewService.addReview(productId, sellerId, review, rating, seller.phoneNo, seller.name);
        });
    }
    // this is transactional operation
    updateProductMeta(productId, metaEntries) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if the product exists
            const product = yield prisma_1.default.product.findUnique({
                where: { productId },
            });
            if (!product) {
                throw new ApiError_1.default(404, 'পণ্য পাওয়া যায়নি।');
            }
            const result = yield prisma_1.default.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                // manually clear the meta data don't use meta service
                yield prisma.productMeta.deleteMany({
                    where: { productId },
                });
                // add new meta data
                const newMetaData = metaEntries.map(entry => ({
                    productId,
                    key: entry.key,
                    value: entry.value,
                }));
                return yield prisma.productMeta.createMany({
                    data: newMetaData,
                });
            }));
            return this.getProduct(product.productId);
        });
    }
    deleteImage(productId, imageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.getProduct(productId);
            if (!product) {
                throw new ApiError_1.default(404, 'পণ্য পাওয়া যায়নি।');
            }
            // check whether the image exists
            const image = yield prisma_1.default.productImage.findUnique({
                where: { imageId },
            });
            if (!image) {
                throw new ApiError_1.default(404, 'ছবি পাওয়া যায়নি।');
            }
            //check whether the image is related to this product
            if (image.productId !== productId) {
                throw new ApiError_1.default(400, 'ছবি এই পণ্যের নয়।');
            }
            yield this.imageService.deleteImage(imageId);
            return this.getProduct(product.productId);
        });
    }
}
exports.default = new ProductService();
