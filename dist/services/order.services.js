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
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../utils/prisma"));
const user_services_1 = __importDefault(require("./user.services"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const wallet_services_1 = __importDefault(require("./wallet.services"));
const product_services_1 = __importDefault(require("./product.services"));
const order_utils_1 = require("../utils/order.utils");
class OrderServices {
    /**
     * Create order from frontend data (dummy implementation)
     * @param frontendData - Minimal order data from frontend
     * @param sellerId - Authenticated seller's ID
     * @returns Created order
     */
    createOrder(frontendData, sellerId) {
        return __awaiter(this, void 0, void 0, function* () {
            // [Backend Fetching Needed] Get complete seller info
            const seller = yield user_services_1.default.getUserByUserId(sellerId);
            const { name: sellerName, phoneNo: sellerPhoneNo, balance: sellerBalance, isVerified: sellerVerified, shopName: sellerShopName } = seller;
            // [Backend Fetching Needed] Get admin wallet info
            const { walletId: adminWalletId, walletName: adminWalletName, walletPhoneNo: adminWalletPhoneNo } = yield wallet_services_1.default.getWalletById(frontendData.adminWalletId);
            const existingTransactionId = yield prisma_1.default.order.findFirst({
                where: {
                    transactionId: frontendData.transactionId,
                }
            });
            if (existingTransactionId) {
                throw new ApiError_1.default(400, 'Transaction ID already exists');
            }
            // [Backend Fetching Needed] Get product details (name, image, base price) for each product
            const enrichedProductsPromise = frontendData.products.map((product) => __awaiter(this, void 0, void 0, function* () {
                const { productId, name: productName, basePrice: productBasePrice, images } = yield product_services_1.default.getProduct(product.productId);
                const isValidImage = images.some((image) => image.imageUrl === product.productImage);
                if (!isValidImage) {
                    throw new ApiError_1.default(400, 'Invalid product image');
                }
                return Object.assign(Object.assign({}, product), { productName,
                    productBasePrice, productTotalBasePrice: productBasePrice.times(product.productQuantity), productTotalSellingPrice: product.productSellingPrice * product.productQuantity });
            }));
            const enrichedProducts = yield Promise.all(enrichedProductsPromise);
            const { totalAmount, totalCommission, totalProductBasePrice, totalProductQuantity, totalProductSellingPrice } = (0, order_utils_1.calculateProductsSummary)(enrichedProducts);
            const actualCommission = totalCommission;
            const { needsPayment, amountToPay, deliveryCharge } = (0, order_utils_1.calculateAmountToPay)({
                zilla: frontendData.customerZilla,
                isVerified: seller.isVerified,
                sellerBalance: sellerBalance.toNumber(),
                productCount: totalProductQuantity
            });
            if (needsPayment && !frontendData.isDeliveryChargePaidBySeller) {
                throw new ApiError_1.default(400, 'Delivery charge must be paid');
            }
            if (needsPayment && frontendData.isDeliveryChargePaidBySeller &&
                (frontendData.deliveryChargePaidBySeller === undefined ||
                    frontendData.deliveryChargePaidBySeller < amountToPay)) {
                throw new ApiError_1.default(400, 'The Amount Paid is not enough');
            }
            // Create order in transaction
            const newOrder = yield prisma_1.default.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                const order = yield prisma.order.create({
                    data: {
                        // Seller info (from backend)
                        sellerId,
                        sellerName,
                        sellerPhoneNo,
                        sellerVerified,
                        sellerShopName,
                        sellerBalance,
                        // Customer info (from frontend)
                        customerName: frontendData.customerName,
                        customerPhoneNo: frontendData.customerPhoneNo,
                        customerZilla: frontendData.customerZilla,
                        customerUpazilla: frontendData.customerUpazilla,
                        deliveryAddress: frontendData.deliveryAddress,
                        comments: frontendData.comments,
                        // Payment info
                        deliveryCharge,
                        isDeliveryChargePaidBySeller: frontendData.isDeliveryChargePaidBySeller,
                        deliveryChargePaidBySeller: frontendData.deliveryChargePaidBySeller,
                        transactionId: frontendData.transactionId,
                        sellerWalletName: frontendData.sellerWalletName,
                        sellerWalletPhoneNo: frontendData.sellerWalletPhoneNo,
                        // Admin wallet info (from backend)
                        adminWalletId,
                        adminWalletName,
                        adminWalletPhoneNo,
                        // Calculated totals
                        totalAmount: totalAmount + deliveryCharge,
                        totalCommission,
                        actualCommission,
                        totalProductBasePrice,
                        totalProductSellingPrice,
                        totalProductQuantity,
                        // Products
                        orderProducts: {
                            create: enrichedProducts.map(product => ({
                                productId: product.productId,
                                productName: product.productName,
                                productImage: product.productImage,
                                productBasePrice: product.productBasePrice,
                                productSellingPrice: product.productSellingPrice,
                                productQuantity: product.productQuantity,
                                productTotalBasePrice: product.productBasePrice.times(product.productQuantity),
                                productTotalSellingPrice: product.productSellingPrice * product.productQuantity,
                                selectedOptions: product.selectedOptions
                            }))
                        }
                    },
                    include: {
                        orderProducts: true
                    }
                });
                return order;
            }));
            return newOrder;
        });
    }
    // Basic order status update
    updateOrderStatus(orderId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield prisma_1.default.order.update({
                where: { orderId },
                data: Object.assign({ orderStatus: status, orderUpdatedAt: new Date() }, (status === client_1.OrderStatus.completed && { orderCompletedAt: new Date() }))
            });
            return order;
        });
    }
    // Basic order retrieval
    getOrderById(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.order.findUnique({
                where: { orderId },
                include: { orderProducts: true }
            });
        });
    }
}
exports.default = new OrderServices();
