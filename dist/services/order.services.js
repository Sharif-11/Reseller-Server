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
const transaction_services_1 = __importDefault(require("./transaction.services"));
const config_1 = __importDefault(require("../config"));
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
            let adminWalletId = null;
            let adminWalletName = null;
            let adminWalletPhoneNo = null;
            if (needsPayment && frontendData.isDeliveryChargePaidBySeller) {
                const { walletId, walletName, walletPhoneNo } = yield wallet_services_1.default.getWalletById(frontendData.adminWalletId);
                const existingTransactionId = yield prisma_1.default.order.findFirst({
                    where: {
                        transactionId: frontendData.transactionId,
                    }
                });
                if (existingTransactionId) {
                    throw new ApiError_1.default(400, 'Transaction ID already exists');
                }
                adminWalletId = walletId;
                adminWalletName = walletName;
                adminWalletPhoneNo = walletPhoneNo;
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
                        deliveryChargeMustBePaidBySeller: amountToPay,
                        deliveryChargePaidBySeller: amountToPay,
                        transactionId: frontendData.transactionId,
                        sellerWalletName: frontendData.sellerWalletName,
                        sellerWalletPhoneNo: frontendData.sellerWalletPhoneNo,
                        // Admin wallet info (from backend)
                        adminWalletId,
                        adminWalletName,
                        adminWalletPhoneNo,
                        // Calculated totals
                        totalAmount,
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
    /**
     * Get order by ID
     * @param orderId - Order ID to be fetched
     * @return Order details
     */
    getOrderById(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield prisma_1.default.order.findUnique({
                where: { orderId },
                include: { orderProducts: true }
            });
            if (!order) {
                throw new ApiError_1.default(404, 'Order not found');
            }
            return order;
        });
    }
    /**
     * Approve Order By Admin
     * @param orderId - Order ID to be approved
     * @return Updated order
     */
    approveOrderByAdmin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ orderId, transactionId }) {
            var _b;
            // [Backend Fetching Needed] Get order details
            const order = yield this.getOrderById(orderId);
            if (order.orderStatus !== client_1.OrderStatus.pending) {
                throw new ApiError_1.default(400, 'শুধুমাত্র পেন্ডিং অর্ডার অনুমোদন করা যাবে');
            }
            if (order.transactionVerified) {
                throw new ApiError_1.default(400, 'অর্ডার ইতোমধ্যে যাচাই করা হয়েছে');
            }
            // Check if the transaction ID matches the order's transaction ID
            if (order.isDeliveryChargePaidBySeller && order.transactionId !== transactionId) {
                throw new ApiError_1.default(400, 'ট্রানজেকশন আইডি মিলছে না');
            }
            // Check if the order is already is cancelled by user 
            if (order.cancelledByUser) {
                // Here We need to update the order status to cancelled , verify the transaction and add the amount to the seller wallets within transaction
                if (order.isDeliveryChargePaidBySeller) {
                    const updatedOrder = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                        const updatedOrder = yield tx.order.update({
                            where: { orderId },
                            data: {
                                orderStatus: client_1.OrderStatus.refunded,
                                transactionVerified: true,
                            },
                        });
                        yield transaction_services_1.default.refundOrderCancellation({
                            tx,
                            userId: order.sellerId,
                            amount: order.deliveryChargePaidBySeller.toNumber(),
                        });
                        return updatedOrder;
                    }));
                    return updatedOrder;
                }
                else {
                    const updatedOrder = yield prisma_1.default.order.update({
                        where: { orderId },
                        data: {
                            orderStatus: client_1.OrderStatus.cancelled,
                            transactionVerified: true,
                        },
                    });
                    return updatedOrder;
                }
            }
            const { deductFromBalance, addToBalance } = (0, order_utils_1.calculateAmountToDeductOrAddForOrder)({
                isDeliveryChargePaidBySeller: order.isDeliveryChargePaidBySeller,
                deliveryChargePaidBySeller: ((_b = order.deliveryChargePaidBySeller) === null || _b === void 0 ? void 0 : _b.toNumber()) || null,
                totalDeliveryCharge: order.deliveryCharge.toNumber(),
            });
            if (deductFromBalance) {
                // here we need to update use and deduct from balance as order deposit within transaction
                const updatedOrder = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const updatedOrder = yield tx.order.update({
                        where: { orderId },
                        data: {
                            orderStatus: client_1.OrderStatus.approved,
                            transactionVerified: true,
                        },
                    });
                    yield transaction_services_1.default.deductDeliveryChargeForOrderApproval({
                        tx,
                        userId: order.sellerId,
                        amount: deductFromBalance,
                    });
                    return updatedOrder;
                }));
                return updatedOrder;
            }
            else if (addToBalance) {
                // update the order status to approved and add the amount to the seller wallets within transaction
                const updatedOrder = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const updatedOrder = yield tx.order.update({
                        where: { orderId },
                        data: {
                            orderStatus: client_1.OrderStatus.approved,
                            transactionVerified: true,
                        },
                    });
                    yield transaction_services_1.default.compensateDue({
                        tx,
                        userId: order.sellerId,
                        amount: addToBalance,
                        transactionId: order.transactionId,
                        paymentPhoneNo: order.sellerWalletPhoneNo,
                        paymentMethod: order.sellerWalletName,
                    });
                    return updatedOrder;
                }));
                return updatedOrder;
            }
            else {
                const updatedOrder = yield prisma_1.default.order.update({
                    where: { orderId },
                    data: {
                        orderStatus: client_1.OrderStatus.approved,
                        transactionVerified: true,
                    },
                });
                return updatedOrder;
            }
        });
    }
    /**
     * Reject Order By Admin
     * @param orderId - Order ID to be rejected
     * @return Updated order
      */
    rejectOrderByAdmin(orderId, remarks) {
        return __awaiter(this, void 0, void 0, function* () {
            // [Backend Fetching Needed] Get order details
            const order = yield this.getOrderById(orderId);
            if (order.orderStatus !== client_1.OrderStatus.pending) {
                throw new ApiError_1.default(400, 'শুধুমাত্র পেন্ডিং অর্ডার বাতিল করা যাবে');
            }
            if (order.transactionVerified) {
                throw new ApiError_1.default(400, 'অর্ডার ইতোমধ্যে যাচাই করা হয়েছে');
            }
            if (order.cancelledByUser) {
                // delete the order  along with the products
                const deletedOrder = yield prisma_1.default.order.delete({
                    where: { orderId },
                    include: { orderProducts: true }
                });
                return deletedOrder;
            }
            // Update order status to rejected
            else {
                const updatedOrder = yield prisma_1.default.order.update({
                    where: { orderId },
                    data: {
                        orderStatus: client_1.OrderStatus.rejected,
                        transactionId: null,
                        remarks: `${order.transactionId}=${remarks}`,
                    },
                });
                return updatedOrder;
            }
        });
    }
    /**
     * Cancel Order By Seller
     * @param orderId - Order ID to be cancelled
     * @return Updated order
     * */
    cancelOrderBySeller(orderId, sellerId) {
        return __awaiter(this, void 0, void 0, function* () {
            // [Backend Fetching Needed] Get order details
            const order = yield this.getOrderById(orderId);
            if (order.cancelledByUser) {
                throw new ApiError_1.default(400, 'অর্ডার ইতোমধ্যে বাতিল করা হয়েছে');
            }
            // check if the order is belongs to the seller
            if (order.sellerId !== sellerId) {
                throw new ApiError_1.default(400, 'অর্ডারটি আপনার নয়');
            }
            const cancellable = order.orderStatus === client_1.OrderStatus.pending || order.orderStatus === client_1.OrderStatus.approved;
            if (!cancellable) {
                throw new ApiError_1.default(400, 'শুধুমাত্র অনুমোদিত অথবা পেন্ডিং অর্ডার বাতিল করা যাবে');
            }
            const updatedOrder = yield prisma_1.default.order.update({
                where: { orderId },
                data: {
                    cancelledByUser: true,
                },
            });
            return updatedOrder;
            // Update order status to cancelled and refunds the delivery charge to the seller within transaction
        });
    }
    /**
     * Cancel Order By Admin
     * @param orderId - Order ID to be cancelled
     * @return Updated order
     */
    cancelOrderByAdmin(orderId, remarks) {
        return __awaiter(this, void 0, void 0, function* () {
            // [Backend Fetching Needed] Get order details
            const order = yield this.getOrderById(orderId);
            const cancellable = order.orderStatus === client_1.OrderStatus.processing || order.orderStatus === client_1.OrderStatus.approved;
            if (!cancellable) {
                throw new ApiError_1.default(400, 'শুধুমাত্র অনুমোদিত অথবা প্রক্রিয়াধীন অর্ডার বাতিল করা যাবে');
            }
            // Update order status to cancelled and refunds the delivery charge to the seller within transaction
            const updatedOrder = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const updatedOrder = yield tx.order.update({
                    where: { orderId },
                    data: {
                        orderStatus: client_1.OrderStatus.refunded,
                        remarks: remarks ? remarks : null,
                    },
                });
                yield transaction_services_1.default.refundOrderCancellation({
                    tx,
                    userId: order.sellerId,
                    amount: order.deliveryCharge.toNumber(),
                });
                return updatedOrder;
            }));
            return updatedOrder;
        });
    }
    /**
     * Process Order By Admin
     * @param orderId - Order ID to be processed
     * @return Updated order
     * */
    processOrderByAdmin(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            // [Backend Fetching Needed] Get order details
            const order = yield this.getOrderById(orderId);
            if (order.orderStatus !== client_1.OrderStatus.approved) {
                throw new ApiError_1.default(400, 'শুধুমাত্র অনুমোদিত অর্ডার প্রক্রিয়া করা যাবে');
            }
            // Update order status to processing
            if (order.cancelledByUser) {
                // Here We need to update the order status to cancelled , verify the transaction and add the amount to the seller wallets within transaction
                const updatedOrder = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const updatedOrder = yield tx.order.update({
                        where: { orderId },
                        data: {
                            orderStatus: client_1.OrderStatus.refunded,
                            transactionVerified: true,
                        },
                    });
                    yield transaction_services_1.default.refundOrderCancellation({
                        tx,
                        userId: order.sellerId,
                        amount: order.deliveryCharge.toNumber(),
                    });
                    return updatedOrder;
                }));
                return updatedOrder;
            }
            else {
                const updatedOrder = yield prisma_1.default.order.update({
                    where: { orderId },
                    data: {
                        orderStatus: client_1.OrderStatus.processing,
                    },
                });
                return updatedOrder;
            }
        });
    }
    /**
     * Shipped Order By Admin
     * @param orderId - Order ID to be shipped
     * courierName - Courier name
     * trackingURL - Tracking URL
      * @return Updated order
     */
    shipOrderByAdmin(orderId, courierName, trackingURL) {
        return __awaiter(this, void 0, void 0, function* () {
            // [Backend Fetching Needed] Get order details
            const order = yield this.getOrderById(orderId);
            if (order.orderStatus !== client_1.OrderStatus.processing) {
                throw new ApiError_1.default(400, 'শুধুমাত্র প্রক্রিয়াধীন অর্ডার শিপ করা যাবে');
            }
            // Update order status to shipped
            const updatedOrder = yield prisma_1.default.order.update({
                where: { orderId },
                data: {
                    orderStatus: client_1.OrderStatus.shipped,
                    courierName,
                    trackingURL,
                },
            });
            return updatedOrder;
        });
    }
    /**
     * Complete Order By Admin
     * @param orderId - Order ID to be delivered
     * amountPaidByCustomer - Amount paid by customer
     * @return Updated order
     */
    completeOrderByAdmin(orderId, amountPaidByCustomer) {
        return __awaiter(this, void 0, void 0, function* () {
            // [Backend Fetching Needed] Get order details
            const order = yield this.getOrderById(orderId);
            if (order.orderStatus !== client_1.OrderStatus.shipped) {
                throw new ApiError_1.default(400, 'শুধুমাত্র শিপ করা অর্ডার সম্পন্ন করা যাবে');
            }
            // Update order status to completed and add the amount to the seller wallets within transaction
            if (amountPaidByCustomer < order.totalProductBasePrice.toNumber()) {
                throw new ApiError_1.default(400, 'প্রদত্ত পরিমাণ পণ্যের মোট বেস মূল্যের চেয়ে কম');
            }
            const actualCommission = amountPaidByCustomer - order.totalProductBasePrice.toNumber();
            const updatedOrder = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const updatedOrder = yield tx.order.update({
                    where: { orderId },
                    data: {
                        orderStatus: client_1.OrderStatus.completed,
                        totalAmountPaidByCustomer: amountPaidByCustomer,
                        actualCommission,
                    },
                });
                // count how many order are completed
                const completedOrdersCount = yield tx.order.count({
                    where: {
                        orderStatus: client_1.OrderStatus.completed,
                        sellerId: order.sellerId,
                    },
                });
                // verify the seller
                const isVerified = completedOrdersCount >= config_1.default.minimumOrderCompletedToBeVerified ? true : false;
                yield tx.user.update({
                    where: { userId: order.sellerId },
                    data: { isVerified },
                });
                yield transaction_services_1.default.addSellerCommission({
                    tx,
                    userId: order.sellerId,
                    amount: actualCommission,
                    userName: order.sellerName,
                    userPhoneNo: order.sellerPhoneNo,
                });
                yield transaction_services_1.default.returnDeliveryChargeAfterOrderCompletion({
                    tx,
                    amount: order.deliveryCharge.toNumber(),
                    userName: order.sellerName,
                    userPhoneNo: order.sellerPhoneNo,
                    userId: order.sellerId,
                });
                return updatedOrder;
            }));
            return updatedOrder;
        });
    }
    /**
     * Return orders by Admin
      * @param orderId - Order ID to be returned
      * @return Updated order
      * */
    returnOrderByAdmin(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            // [Backend Fetching Needed] Get order details
            const order = yield this.getOrderById(orderId);
            if (order.orderStatus !== client_1.OrderStatus.shipped) {
                throw new ApiError_1.default(400, 'শুধুমাত্র শিপ করা অর্ডার ফেরত দেওয়া যাবে');
            }
            // Update order status to returned and add the amount to the seller wallets within transaction
            const updatedOrder = yield prisma_1.default.order.update({
                where: { orderId },
                data: {
                    orderStatus: client_1.OrderStatus.returned,
                },
            });
            return updatedOrder;
        });
    }
}
exports.default = new OrderServices();
