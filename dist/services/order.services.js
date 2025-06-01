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
const decimal_js_1 = __importDefault(require("decimal.js"));
const config_1 = __importDefault(require("../config"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const commission_services_1 = __importDefault(require("./commission.services"));
const payment_services_1 = __importDefault(require("./payment.services"));
const product_services_1 = __importDefault(require("./product.services"));
const sms_services_1 = __importDefault(require("./sms.services"));
const transaction_services_1 = __importDefault(require("./transaction.services"));
const user_services_1 = __importDefault(require("./user.services"));
const wallet_services_1 = __importDefault(require("./wallet.services"));
class OrderServices {
    calculateExtraDeliveryCharge(productCount) {
        if (productCount <= 3)
            return 0;
        if (productCount === 4)
            return 10;
        // For 5+ products: 10 tk for the 4th product + 5 tk for every 2 additional products
        const additionalProducts = productCount - 4;
        let temp = 0;
        if (additionalProducts % 2 === 0) {
            temp = (additionalProducts / 2) * 5;
        }
        else {
            temp = ((additionalProducts - 1) / 2) * 5;
        }
        return 10 + temp;
    }
    deriveProductsSummary(products) {
        const totalProductQuantity = products.reduce((total, product) => total + product.productQuantity, 0);
        const totalProductBasePrice = products.reduce((total, product) => total.plus(product.productTotalBasePrice.toNumber()), new decimal_js_1.default(0));
        const totalProductSellingPrice = products.reduce((total, product) => total + product.productTotalSellingPrice, 0);
        const totalCommission = products.reduce((total, product) => total
            .plus(product.productTotalSellingPrice)
            .minus(product.productTotalBasePrice.toNumber()), new decimal_js_1.default(0));
        const totalAmount = products.reduce((total, product) => total + product.productTotalSellingPrice, 0);
        return {
            totalProductQuantity,
            totalProductBasePrice,
            totalProductSellingPrice,
            totalCommission,
            totalAmount,
            actualCommission: totalCommission.toNumber(),
            extraDeliveryCharge: this.calculateExtraDeliveryCharge(totalProductQuantity),
        };
    }
    verifyOrderProducts(products) {
        return __awaiter(this, void 0, void 0, function* () {
            const productPremises = products.map((product) => __awaiter(this, void 0, void 0, function* () {
                const { productId, name: productName, basePrice: productBasePrice, images, published, imageUrl, } = yield product_services_1.default.getProduct(product.productId);
                const isValidImage = images.some(image => image.imageUrl === product.productImage) ||
                    imageUrl === product.productImage;
                if (!published) {
                    throw new ApiError_1.default(400, 'Hidden product cannot be ordered');
                }
                if (!isValidImage) {
                    throw new ApiError_1.default(400, 'Invalid product image');
                }
                return Object.assign(Object.assign({}, product), { productName,
                    productBasePrice, productTotalBasePrice: productBasePrice.times(product.productQuantity), productTotalSellingPrice: product.productSellingPrice * product.productQuantity });
            }));
            try {
                yield Promise.all(productPremises);
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
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
            const { name: sellerName, phoneNo: sellerPhoneNo, balance: sellerBalance, isVerified: sellerVerified, shopName: sellerShopName, } = seller;
            // [Backend Fetching Needed] Get product details (name, image, base price) for each product
            const enrichedProductsPromise = frontendData.products.map((product) => __awaiter(this, void 0, void 0, function* () {
                const { productId, name: productName, basePrice: productBasePrice, images, published, imageUrl, } = yield product_services_1.default.getProduct(product.productId);
                const isValidImage = images.some(image => image.imageUrl === product.productImage) ||
                    imageUrl === product.productImage;
                if (!published) {
                    throw new ApiError_1.default(400, 'Hidden product cannot be ordered');
                }
                if (!isValidImage) {
                    throw new ApiError_1.default(400, 'Invalid product image');
                }
                return Object.assign(Object.assign({}, product), { productName,
                    productBasePrice, productTotalBasePrice: productBasePrice.times(product.productQuantity), productTotalSellingPrice: product.productSellingPrice * product.productQuantity });
            }));
            const enrichedProducts = yield Promise.all(enrichedProductsPromise);
            const { totalProductQuantity, totalProductBasePrice, totalProductSellingPrice, totalCommission, totalAmount, actualCommission, extraDeliveryCharge, } = this.deriveProductsSummary(enrichedProducts);
            const totalDeliveryCharge = frontendData.customerZilla
                .toLowerCase()
                .includes('dhaka')
                ? config_1.default.deliveryChargeInsideDhaka
                : config_1.default.deliveryChargeOutsideDhaka + extraDeliveryCharge;
            if (sellerBalance.toNumber() < 0 &&
                !frontendData.isDeliveryChargePaidBySeller) {
                throw new ApiError_1.default(400, 'You need to add balance to your wallet');
            }
            if (!sellerVerified) {
                if (sellerBalance.toNumber() < totalDeliveryCharge &&
                    !frontendData.isDeliveryChargePaidBySeller) {
                    throw new ApiError_1.default(400, 'You needs to pay the delivery charge in advance or add balance to your wallet');
                }
            }
            if (frontendData.isDeliveryChargePaidBySeller) {
                if (frontendData.deliveryChargePaidBySeller < totalDeliveryCharge) {
                    throw new ApiError_1.default(400, 'Insufficient delivery charge paid by seller');
                }
                const existingTransaction = yield prisma_1.default.payment.findUnique({
                    where: {
                        transactionId: frontendData.transactionId,
                    },
                });
                if (existingTransaction) {
                    throw new ApiError_1.default(400, 'এই ট্রানজেকশন আইডি ইতিমধ্যে ব্যবহৃত হয়েছে');
                }
            }
            // get admin wallet info
            let adminWalletName = null;
            let adminWalletPhoneNo = null;
            if (frontendData.adminWalletId) {
                const adminWallet = yield wallet_services_1.default.getWalletById(frontendData.adminWalletId);
                if (adminWallet) {
                    adminWalletName = adminWallet.walletName;
                    adminWalletPhoneNo = adminWallet.walletPhoneNo;
                }
                else {
                    throw new ApiError_1.default(400, 'Invalid admin wallet ID');
                }
            }
            // we need to create the order within transaction, here we need to create a payment record also for the order
            const isDeductBalance = !sellerVerified &&
                !frontendData.isDeliveryChargePaidBySeller &&
                sellerBalance.toNumber() >= totalDeliveryCharge;
            try {
                const order = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    // Create order
                    const createdOrder = yield tx.order.create({
                        data: {
                            customerName: frontendData.customerName,
                            customerPhoneNo: frontendData.customerPhoneNo,
                            customerZilla: frontendData.customerZilla,
                            customerUpazilla: frontendData.customerUpazilla,
                            deliveryAddress: frontendData.deliveryAddress,
                            comments: frontendData.comments,
                            totalProductQuantity,
                            totalProductBasePrice,
                            totalProductSellingPrice,
                            totalCommission,
                            totalAmount,
                            actualCommission,
                            sellerId,
                            sellerName,
                            sellerPhoneNo,
                            sellerShopName,
                            sellerVerified,
                            sellerBalance,
                            orderStatus: frontendData.isDeliveryChargePaidBySeller
                                ? 'unverified'
                                : 'pending',
                            adminWalletId: frontendData.adminWalletId,
                            isDeliveryChargePaidBySeller: frontendData.isDeliveryChargePaidBySeller,
                            deliveryChargePaidBySeller: frontendData.deliveryChargePaidBySeller || null,
                            transactionId: frontendData.transactionId || null,
                            adminWalletName: adminWalletName || null,
                            adminWalletPhoneNo: adminWalletPhoneNo || null,
                            sellerWalletName: frontendData.sellerWalletName || null,
                            sellerWalletPhoneNo: frontendData.sellerWalletPhoneNo || null,
                            deliveryCharge: totalDeliveryCharge,
                            cashOnAmount: frontendData.isDeliveryChargePaidBySeller || isDeductBalance
                                ? totalAmount
                                : totalAmount + totalDeliveryCharge,
                            orderProducts: {
                                create: enrichedProducts.map(product => ({
                                    productId: product.productId,
                                    productName: product.productName,
                                    productBasePrice: product.productBasePrice,
                                    productImage: product.productImage,
                                    productSellingPrice: product.productSellingPrice,
                                    selectedOptions: product.selectedOptions,
                                    productQuantity: product.productQuantity,
                                    productTotalBasePrice: product.productTotalBasePrice,
                                    productTotalSellingPrice: product.productTotalSellingPrice,
                                })),
                            },
                        },
                    });
                    // Create order products
                    if (frontendData.isDeliveryChargePaidBySeller) {
                        try {
                            yield payment_services_1.default.createOrderPaymentRequest({
                                tx,
                                amount: frontendData.deliveryChargePaidBySeller,
                                transactionId: frontendData.transactionId,
                                sellerWalletName: frontendData.sellerWalletName,
                                sellerWalletPhoneNo: frontendData.sellerWalletPhoneNo,
                                adminWalletId: frontendData.adminWalletId,
                                adminWalletName: adminWalletName,
                                adminWalletPhoneNo: adminWalletPhoneNo,
                                sellerId,
                                sellerName,
                                sellerPhoneNo,
                                orderId: createdOrder.orderId,
                            });
                        }
                        catch (error) {
                            console.log('Error creating order payment request:', error);
                            throw error;
                        }
                    }
                    if (isDeductBalance) {
                        // we need to create a transaction record for the delivery charge deduction
                        yield transaction_services_1.default.deductDeliveryChargeForOrder({
                            tx,
                            userId: sellerId,
                            amount: totalDeliveryCharge,
                            remarks: 'অর্ডার ভেরিফিকেশনের জন্য ডেলিভারি চার্জ কাটা হয়েছে',
                        });
                    }
                    // Find admin
                    const admin = yield user_services_1.default.getAdminForTheUsers();
                    yield sms_services_1.default.sendOrderNotificationToAdmin({
                        mobileNo: admin.phoneNo,
                        orderId: createdOrder.orderId,
                        sellerName: createdOrder.sellerName,
                        sellerPhoneNo: createdOrder.sellerPhoneNo,
                        customerName: createdOrder.customerName,
                        customerPhoneNo: createdOrder.customerPhoneNo,
                        deliveryAddress: createdOrder.deliveryAddress,
                    });
                    return createdOrder;
                }));
                return order;
            }
            catch (error) {
                throw error;
            }
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
                include: { orderProducts: true },
            });
            if (!order) {
                throw new ApiError_1.default(404, 'অর্ডার পাওয়া যায়নি');
            }
            return order;
        });
    }
    // /**
    //  * Approve Order By Admin
    //  * @param orderId - Order ID to be approved
    //  * @return Updated order
    //  */
    // async approveOrderByAdmin({
    //   orderId,
    //   transactionId,
    // }: {
    //   orderId: number
    //   transactionId?: string
    // }): Promise<Order> {
    //   // [Backend Fetching Needed] Get order details
    //   const order = await this.getOrderById(orderId)
    //   if (order.orderStatus !== OrderStatus.pending) {
    //     throw new ApiError(400, 'শুধুমাত্র পেন্ডিং অর্ডার অনুমোদন করা যাবে')
    //   }
    //   if (order.transactionVerified) {
    //     throw new ApiError(400, 'অর্ডার ইতোমধ্যে যাচাই করা হয়েছে')
    //   }
    //   // Check if the transaction ID matches the order's transaction ID
    //   if (
    //     order.isDeliveryChargePaidBySeller &&
    //     order.transactionId !== transactionId
    //   ) {
    //     throw new ApiError(400, 'ট্রানজেকশন আইডি মিলছে না')
    //   }
    //   // Check if the order is already is cancelled by user
    //   if (order.cancelledByUser) {
    //     // Here We need to update the order status to cancelled , verify the transaction and add the amount to the seller wallets within transaction
    //     if (order.isDeliveryChargePaidBySeller) {
    //       const updatedOrder = await prisma.$transaction(async tx => {
    //         const updatedOrder = await tx.order.update({
    //           where: { orderId },
    //           data: {
    //             orderStatus: OrderStatus.refunded,
    //             transactionVerified: true,
    //           },
    //         })
    //         await transactionServices.refundOrderCancellation({
    //           tx,
    //           userId: order.sellerId,
    //           amount: order.deliveryChargePaidBySeller!.toNumber(),
    //         })
    //         return updatedOrder
    //       })
    //       return updatedOrder
    //     } else {
    //       const updatedOrder = await prisma.order.update({
    //         where: { orderId },
    //         data: {
    //           orderStatus: OrderStatus.cancelled,
    //           transactionVerified: true,
    //         },
    //       })
    //       return updatedOrder
    //     }
    //   }
    //   const { deductFromBalance, addToBalance } =
    //     calculateAmountToDeductOrAddForOrder({
    //       isDeliveryChargePaidBySeller: order.isDeliveryChargePaidBySeller,
    //       deliveryChargePaidBySeller:
    //         order.deliveryChargePaidBySeller?.toNumber() || null,
    //       totalDeliveryCharge: order.deliveryCharge.toNumber(),
    //     })
    //   if (deductFromBalance) {
    //     // here we need to update use and deduct from balance as order deposit within transaction
    //     const updatedOrder = await prisma.$transaction(async tx => {
    //       const updatedOrder = await tx.order.update({
    //         where: { orderId },
    //         data: {
    //           orderStatus: OrderStatus.approved,
    //           transactionVerified: true,
    //         },
    //       })
    //       await transactionServices.deductDeliveryChargeForOrderApproval({
    //         tx,
    //         userId: order.sellerId,
    //         amount: deductFromBalance,
    //       })
    //       return updatedOrder
    //     })
    //     return updatedOrder
    //   } else if (addToBalance) {
    //     // update the order status to approved and add the amount to the seller wallets within transaction
    //     const updatedOrder = await prisma.$transaction(async tx => {
    //       const updatedOrder = await tx.order.update({
    //         where: { orderId },
    //         data: {
    //           orderStatus: OrderStatus.approved,
    //           transactionVerified: true,
    //         },
    //       })
    //       await transactionServices.compensateDue({
    //         tx,
    //         userId: order.sellerId,
    //         amount: addToBalance,
    //         transactionId: order.transactionId!,
    //         paymentPhoneNo: order.sellerWalletPhoneNo!,
    //         paymentMethod: order.sellerWalletName!,
    //       })
    //       return updatedOrder
    //     })
    //     return updatedOrder
    //   } else {
    //     const updatedOrder = await prisma.order.update({
    //       where: { orderId },
    //       data: {
    //         orderStatus: OrderStatus.approved,
    //         transactionVerified: true,
    //       },
    //     })
    //     return updatedOrder
    //   }
    // }
    // /**
    //  * Reject Order By Admin
    //  * @param orderId - Order ID to be rejected
    //  * @return Updated order
    //  */
    // async rejectOrderByAdmin(orderId: number, remarks?: string): Promise<Order> {
    //   // [Backend Fetching Needed] Get order details
    //   const order = await this.getOrderById(orderId)
    //   if (order.orderStatus !== OrderStatus.pending) {
    //     throw new ApiError(400, 'শুধুমাত্র পেন্ডিং অর্ডার বাতিল করা যাবে')
    //   }
    //   if (order.transactionVerified) {
    //     throw new ApiError(400, 'অর্ডার ইতোমধ্যে যাচাই করা হয়েছে')
    //   }
    //   if (order.cancelledByUser) {
    //     // delete the order  along with the products
    //     const deletedOrder = await prisma.order.delete({
    //       where: { orderId },
    //       include: { orderProducts: true },
    //     })
    //     return deletedOrder
    //   }
    //   // Update order status to rejected
    //   else {
    //     const updatedOrder = await prisma.order.update({
    //       where: { orderId },
    //       data: {
    //         orderStatus: OrderStatus.rejected,
    //         transactionId: null,
    //         remarks: `${order.transactionId}=${remarks}`,
    //       },
    //     })
    //     return updatedOrder
    //   }
    // }
    // /**
    //  * Cancel Order By Seller
    //  * @param orderId - Order ID to be cancelled
    //  * @return Updated order
    //  * */
    cancelOrderBySeller(orderId, sellerId) {
        return __awaiter(this, void 0, void 0, function* () {
            // [Backend Fetching Needed] Get order details
            const order = yield this.getOrderById(orderId);
            if (order.cancelledBySeller) {
                throw new ApiError_1.default(400, 'অর্ডার ইতোমধ্যে বাতিল করা হয়েছে');
            }
            // check if the order is belongs to the seller
            if (order.sellerId !== sellerId) {
                throw new ApiError_1.default(400, 'অর্ডারটি আপনার নয়');
            }
            const cancellable = order.orderStatus === client_1.OrderStatus.pending ||
                order.orderStatus === client_1.OrderStatus.unverified;
            if (!cancellable) {
                throw new ApiError_1.default(400, 'শুধুমাত্র পেন্ডিং অথবা অযাচাইকৃত অর্ডার বাতিল করা যাবে');
            }
            const updatedOrder = yield prisma_1.default.order.update({
                where: { orderId },
                data: {
                    cancelledBySeller: true,
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
            const cancellable = order.orderStatus === client_1.OrderStatus.processing ||
                order.orderStatus === client_1.OrderStatus.pending;
            if (!cancellable) {
                throw new ApiError_1.default(400, 'শুধুমাত্র প্রক্রিয়াধীন অথবা পেন্ডিং অর্ডার বাতিল করা যাবে');
            }
            const refundable = order.isDeliveryChargePaidBySeller ||
                (!order.sellerVerified &&
                    !order.isDeliveryChargePaidBySeller &&
                    order.sellerBalance.toNumber() >= order.deliveryCharge.toNumber());
            if (refundable) {
                // Here We need to update the order status to cancelled , verify the transaction and add the amount to the seller wallets within transaction
                const updatedOrder = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const updatedOrder = yield tx.order.update({
                        where: { orderId },
                        data: {
                            orderStatus: client_1.OrderStatus.refunded,
                            remarks: `${order.transactionId}=${remarks}`,
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
                        orderStatus: client_1.OrderStatus.cancelled,
                        remarks: `${order.transactionId}=${remarks}`,
                    },
                });
                return updatedOrder;
            }
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
            if (order.orderStatus !== client_1.OrderStatus.pending) {
                throw new ApiError_1.default(400, 'শুধুমাত্র পেন্ডিং অর্ডার প্রক্রিয়া করা যাবে');
            }
            // Update order status to processing
            if (order.cancelledBySeller) {
                yield this.cancelOrderByAdmin(orderId, 'Order is cancelled by user');
                return yield this.getOrderById(orderId);
            }
            else {
                const updatedOrder = yield prisma_1.default.order.update({
                    where: { orderId },
                    data: {
                        orderStatus: client_1.OrderStatus.processing,
                    },
                });
                yield sms_services_1.default.notifyOrderProcessed({
                    sellerPhoneNo: updatedOrder.sellerPhoneNo,
                    orderId: updatedOrder.orderId,
                });
                return updatedOrder;
            }
        });
    }
    // /**
    //  * Shipped Order By Admin
    //  * @param orderId - Order ID to be shipped
    //  * courierName - Courier name
    //  * trackingURL - Tracking URL
    //  * @return Updated order
    //  */
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
            yield sms_services_1.default.notifyOrderShipped({
                sellerPhoneNo: updatedOrder.sellerPhoneNo,
                orderId: updatedOrder.orderId,
                trackingUrl: updatedOrder.trackingURL,
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
                const isVerified = completedOrdersCount >= config_1.default.minimumOrderCompletedToBeVerified
                    ? true
                    : false;
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
                // await transactionServices.returnDeliveryChargeAfterOrderCompletion({
                //   tx,
                //   amount: order.deliveryCharge.toNumber(),
                //   userName: order.sellerName,
                //   userPhoneNo: order.sellerPhoneNo,
                //   userId: order.sellerId,
                // })
                // find the seller referrer and add referral commission if exists
                const seller = yield user_services_1.default.getUserDetailByUserId({
                    tx,
                    userId: order.sellerId,
                });
                // const referrer = seller.referredBy
                // if (referrer) {
                //   const referralCommission = referralService.calculateReferralCommission(
                //     1,
                //     order.totalProductBasePrice.toNumber()
                //   )
                //   await transactionServices.addReferralCommission({
                //     tx,
                //     userId: referrer.userId,
                //     amount: referralCommission,
                //     userName: referrer.name,
                //     userPhoneNo: referrer.phoneNo,
                //     referralLevel: 1,
                //     reference: JSON.stringify({
                //       name: order.sellerName,
                //       referralLevel: 1,
                //     }),
                //   })
                // }
                const referrers = yield commission_services_1.default.calculateUserCommissions(seller.phoneNo, order.totalProductBasePrice.toNumber(), tx);
                // console.log('Referrers:', referrers)
                if (referrers.length > 0) {
                    const referralPromises = referrers.map(referrer => transaction_services_1.default.addReferralCommission({
                        tx,
                        userId: referrer.userId,
                        amount: referrer.commissionAmount,
                        userName: referrer.name,
                        userPhoneNo: referrer.phoneNo,
                        referralLevel: referrer.level,
                        reference: JSON.stringify({
                            name: order.sellerName,
                            referralLevel: referrer.level,
                        }),
                    }));
                    yield Promise.all(referralPromises);
                }
                return updatedOrder;
            }), {
                maxWait: 20000, // 10 seconds max wait
                timeout: 60000,
                isolationLevel: 'Serializable',
            });
            yield sms_services_1.default.notifyOrderCompleted({
                sellerPhoneNo: updatedOrder.sellerPhoneNo,
                orderId: updatedOrder.orderId,
                orderAmount: updatedOrder.totalProductSellingPrice.toNumber(),
                commission: updatedOrder.actualCommission.toNumber(),
            });
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
            if (!order.isDeliveryChargePaidBySeller) {
                // update the order status to returned and deduct the amount from the seller wallets within transaction
                const updatedOrder = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const updatedOrder = yield tx.order.update({
                        where: { orderId },
                        data: {
                            orderStatus: client_1.OrderStatus.returned,
                        },
                    });
                    yield transaction_services_1.default.deductDeliveryChargeForOrder({
                        tx,
                        userId: order.sellerId,
                        amount: order.deliveryCharge.toNumber(),
                        remarks: 'অর্ডার ফেরত আসার কারণে ডেলিভারি চার্জ কাটা হয়েছে',
                    });
                    return updatedOrder;
                }));
                try {
                    console.log('Sending SMS to seller:', updatedOrder.sellerPhoneNo);
                    yield sms_services_1.default.sendMessage(updatedOrder.sellerPhoneNo, `আপনার অর্ডার #${updatedOrder.orderId} ফেরত এসেছে।`);
                }
                catch (error) {
                    console.error('Error sending SMS:', error);
                }
                return updatedOrder;
            }
            const updatedOrder = yield prisma_1.default.order.update({
                where: { orderId },
                data: {
                    orderStatus: client_1.OrderStatus.returned,
                },
            });
            try {
                console.log('Sending SMS to seller:', updatedOrder.sellerPhoneNo);
                yield sms_services_1.default.sendMessage(updatedOrder.sellerPhoneNo, `আপনার অর্ডার #${updatedOrder.orderId} ফেরত এসেছে।`);
            }
            catch (error) {
                console.error('Error sending SMS:', error);
            }
            return updatedOrder;
        });
    }
    faultyOrderByAdmin(orderId, remarks) {
        return __awaiter(this, void 0, void 0, function* () {
            // [Backend Fetching Needed] Get order details
            const order = yield this.getOrderById(orderId);
            if (order.orderStatus !== client_1.OrderStatus.shipped) {
                throw new ApiError_1.default(400, 'শুধুমাত্র শিপ করা অর্ডার ফল্টি করা যাবে');
            }
            // Update order status to returned and add the amount to the seller wallets within transaction
            const updatedOrder = yield prisma_1.default.order.update({
                where: { orderId },
                data: {
                    orderStatus: client_1.OrderStatus.faulty,
                    remarks,
                },
            });
            yield sms_services_1.default.sendMessage(updatedOrder.sellerPhoneNo, ` অনুগ্রহ করে এই অর্ডারটি (#${updatedOrder.orderId}) পুনরায় অর্ডার করুন।`);
            return updatedOrder;
        });
    }
    reOrderFaulty(orderId, sellerId) {
        return __awaiter(this, void 0, void 0, function* () {
            // [Backend Fetching Needed] Get order details
            const order = yield this.getOrderById(orderId);
            if (order.orderStatus !== client_1.OrderStatus.faulty) {
                throw new ApiError_1.default(400, 'শুধুমাত্র ফল্টি অর্ডার পুনরায় অর্ডার করা যাবে');
            }
            // check if the order is belongs to the seller
            if (order.sellerId !== sellerId) {
                throw new ApiError_1.default(400, 'অর্ডারটি আপনার নয়');
            }
            const updatedOrder = yield prisma_1.default.order.update({
                where: { orderId },
                data: {
                    orderStatus: client_1.OrderStatus.pending,
                },
            });
            yield sms_services_1.default.sendOrderNotificationToAdmin({
                mobileNo: updatedOrder.sellerPhoneNo,
                orderId: updatedOrder.orderId,
                sellerName: updatedOrder.sellerName,
                sellerPhoneNo: updatedOrder.sellerPhoneNo,
                customerName: updatedOrder.customerName,
                customerPhoneNo: updatedOrder.customerPhoneNo,
                deliveryAddress: updatedOrder.deliveryAddress,
            });
            return updatedOrder;
        });
    }
    /**
     * Get all orders by user ID with pagination and filtering by status, status may be an array or string
     * @param sellerId - Seller ID to fetch orders for
     * @return List of orders
     */
    getOrdersByUserId(_a) {
        return __awaiter(this, arguments, void 0, function* ({ sellerId, status, page = 1, pageSize = 10, }) {
            const orders = yield prisma_1.default.order.findMany({
                where: Object.assign({ sellerId }, (status && {
                    orderStatus: Array.isArray(status) ? { in: status } : status,
                })),
                include: { orderProducts: true },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: {
                    orderCreatedAt: 'desc',
                },
            });
            const totalOrders = yield prisma_1.default.order.count({
                where: Object.assign({ sellerId }, (status && {
                    orderStatus: Array.isArray(status) ? { in: status } : status,
                })),
            });
            const totalPages = Math.ceil(totalOrders / pageSize);
            return {
                orders,
                totalOrders,
                totalPages,
                currentPage: page,
                pageSize,
            };
        });
    }
    getOrdersForAdmin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ status, page = 1, pageSize = 10, }) {
            const orders = yield prisma_1.default.order.findMany({
                where: Object.assign({}, (status && {
                    orderStatus: Array.isArray(status) ? { in: status } : status,
                })),
                include: { orderProducts: true },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: {
                    orderCreatedAt: 'desc',
                },
            });
            const totalOrders = yield prisma_1.default.order.count({
                where: Object.assign({}, (status && {
                    orderStatus: Array.isArray(status) ? { in: status } : status,
                })),
            });
            const totalPages = Math.ceil(totalOrders / pageSize);
            return {
                orders,
                totalOrders,
                totalPages,
                currentPage: page,
                pageSize,
            };
        });
    }
    /**
     * Get seller dashboard statistics
     * @param sellerId - Seller ID to fetch statistics for
     * @return Dashboard statistics including counts, financials, and trends
     */
    /**
     * Get seller dashboard statistics
     * @param sellerId - Seller ID to fetch statistics for
     * @return Dashboard statistics including counts, financials, and trends
     */
    /**
     * Get seller dashboard statistics
     * @param sellerId - Seller ID to fetch statistics for
     * @return Dashboard statistics including counts, financials, and trends
     */
    getSellerDashboardStats(sellerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            // Single query to get all orders with necessary data
            const allOrders = yield prisma_1.default.order.findMany({
                where: { sellerId },
                select: {
                    orderStatus: true,
                    orderCreatedAt: true,
                    totalProductSellingPrice: true,
                    actualCommission: true,
                },
            });
            // Process data in memory to avoid multiple database calls
            const stats = allOrders.reduce((acc, order) => {
                var _a, _b;
                const isLast7Days = order.orderCreatedAt >= sevenDaysAgo;
                const sellingPrice = ((_a = order.totalProductSellingPrice) === null || _a === void 0 ? void 0 : _a.toNumber()) || 0;
                const commission = ((_b = order.actualCommission) === null || _b === void 0 ? void 0 : _b.toNumber()) || 0;
                // Overall counts
                acc.overall.total++;
                if (order.orderStatus === client_1.OrderStatus.completed) {
                    acc.overall.completed++;
                    acc.overall.totalSelling += sellingPrice;
                    acc.overall.totalCommission += commission;
                }
                else if (order.orderStatus === client_1.OrderStatus.returned) {
                    acc.overall.returned++;
                }
                else {
                    acc.overall.others++;
                }
                // Last 7 days counts
                if (isLast7Days) {
                    acc.last7Days.total++;
                    if (order.orderStatus === client_1.OrderStatus.completed) {
                        acc.last7Days.completed++;
                        acc.last7Days.totalSelling += sellingPrice;
                        acc.last7Days.totalCommission += commission;
                    }
                    else if (order.orderStatus === client_1.OrderStatus.returned) {
                        acc.last7Days.returned++;
                    }
                    else {
                        acc.last7Days.others++;
                    }
                }
                return acc;
            }, {
                overall: {
                    total: 0,
                    completed: 0,
                    returned: 0,
                    others: 0,
                    totalSelling: 0,
                    totalCommission: 0,
                },
                last7Days: {
                    total: 0,
                    completed: 0,
                    returned: 0,
                    others: 0,
                    totalSelling: 0,
                    totalCommission: 0,
                },
            });
            return {
                overall: {
                    totalOrders: stats.overall.total,
                    completedOrders: stats.overall.completed,
                    returnedOrders: stats.overall.returned,
                    otherOrders: stats.overall.others,
                    totalSelling: stats.overall.totalSelling,
                    totalCommission: stats.overall.totalCommission,
                },
                last7Days: {
                    totalOrders: stats.last7Days.total,
                    completedOrders: stats.last7Days.completed,
                    returnedOrders: stats.last7Days.returned,
                    otherOrders: stats.last7Days.others,
                    totalSelling: stats.last7Days.totalSelling,
                    totalCommission: stats.last7Days.totalCommission,
                },
            };
        });
    }
    getAdminDashboardStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            // Single query to get all orders with necessary data including seller phone number
            const allOrders = yield prisma_1.default.order.findMany({
                select: {
                    orderStatus: true,
                    orderCreatedAt: true,
                    totalProductSellingPrice: true,
                    actualCommission: true,
                    sellerId: true,
                    sellerName: true,
                    sellerPhoneNo: true, // Added seller phone number
                },
            });
            // Process data in memory for main stats
            const stats = allOrders.reduce((acc, order) => {
                var _a, _b;
                const isLast7Days = order.orderCreatedAt >= sevenDaysAgo;
                const sellingPrice = ((_a = order.totalProductSellingPrice) === null || _a === void 0 ? void 0 : _a.toNumber()) || 0;
                const commission = ((_b = order.actualCommission) === null || _b === void 0 ? void 0 : _b.toNumber()) || 0;
                // Overall counts
                acc.overall.total++;
                if (order.orderStatus === client_1.OrderStatus.completed) {
                    acc.overall.completed++;
                    acc.overall.totalSelling += sellingPrice;
                    acc.overall.totalCommission += commission;
                }
                else if (order.orderStatus === client_1.OrderStatus.returned) {
                    acc.overall.returned++;
                }
                else {
                    acc.overall.others++;
                }
                // Last 7 days counts
                if (isLast7Days) {
                    acc.last7Days.total++;
                    if (order.orderStatus === client_1.OrderStatus.completed) {
                        acc.last7Days.completed++;
                        acc.last7Days.totalSelling += sellingPrice;
                        acc.last7Days.totalCommission += commission;
                    }
                    else if (order.orderStatus === client_1.OrderStatus.returned) {
                        acc.last7Days.returned++;
                    }
                    else {
                        acc.last7Days.others++;
                    }
                }
                return acc;
            }, {
                overall: {
                    total: 0,
                    completed: 0,
                    returned: 0,
                    others: 0,
                    totalSelling: 0,
                    totalCommission: 0,
                },
                last7Days: {
                    total: 0,
                    completed: 0,
                    returned: 0,
                    others: 0,
                    totalSelling: 0,
                    totalCommission: 0,
                },
            });
            // Calculate additional metrics
            const uniqueSellerIds = [...new Set(allOrders.map(order => order.sellerId))];
            const totalSellers = uniqueSellerIds.length;
            const activeSellersLast7Days = [
                ...new Set(allOrders
                    .filter(order => order.orderCreatedAt >= sevenDaysAgo)
                    .map(order => order.sellerId)),
            ].length;
            // Calculate top performing sellers (by completed orders revenue) - Overall
            const sellerPerformanceMap = new Map();
            allOrders.forEach(order => {
                var _a, _b;
                if (order.orderStatus === client_1.OrderStatus.completed) {
                    const sellerData = sellerPerformanceMap.get(order.sellerId) || {
                        sellerId: order.sellerId,
                        sellerName: order.sellerName,
                        sellerPhoneNo: order.sellerPhoneNo, // Include phone number
                        totalSelling: 0,
                        totalCommission: 0,
                        completedOrderCount: 0,
                        totalOrderCount: 0,
                    };
                    const sellingPrice = ((_a = order.totalProductSellingPrice) === null || _a === void 0 ? void 0 : _a.toNumber()) || 0;
                    const commission = ((_b = order.actualCommission) === null || _b === void 0 ? void 0 : _b.toNumber()) || 0;
                    sellerData.totalSelling += sellingPrice;
                    sellerData.totalCommission += commission;
                    sellerData.completedOrderCount++;
                    sellerPerformanceMap.set(order.sellerId, sellerData);
                }
            });
            // Add total order count for each seller (including all statuses)
            allOrders.forEach(order => {
                if (sellerPerformanceMap.has(order.sellerId)) {
                    const sellerData = sellerPerformanceMap.get(order.sellerId);
                    sellerData.totalOrderCount++;
                    sellerPerformanceMap.set(order.sellerId, sellerData);
                }
            });
            const topSellers = Array.from(sellerPerformanceMap.values())
                .sort((a, b) => b.totalSelling - a.totalSelling)
                .slice(0, 5);
            // Calculate top performing sellers for last 7 days
            const sellerPerformanceLast7DaysMap = new Map();
            allOrders.forEach(order => {
                var _a, _b;
                const isLast7Days = order.orderCreatedAt >= sevenDaysAgo;
                if (isLast7Days && order.orderStatus === client_1.OrderStatus.completed) {
                    const sellerData = sellerPerformanceLast7DaysMap.get(order.sellerId) || {
                        sellerId: order.sellerId,
                        sellerName: order.sellerName,
                        sellerPhoneNo: order.sellerPhoneNo,
                        totalSelling: 0,
                        totalCommission: 0,
                        completedOrderCount: 0,
                        totalOrderCount: 0,
                    };
                    const sellingPrice = ((_a = order.totalProductSellingPrice) === null || _a === void 0 ? void 0 : _a.toNumber()) || 0;
                    const commission = ((_b = order.actualCommission) === null || _b === void 0 ? void 0 : _b.toNumber()) || 0;
                    sellerData.totalSelling += sellingPrice;
                    sellerData.totalCommission += commission;
                    sellerData.completedOrderCount++;
                    sellerPerformanceLast7DaysMap.set(order.sellerId, sellerData);
                }
            });
            // Add total order count for last 7 days (including all statuses)
            allOrders.forEach(order => {
                const isLast7Days = order.orderCreatedAt >= sevenDaysAgo;
                if (isLast7Days && sellerPerformanceLast7DaysMap.has(order.sellerId)) {
                    const sellerData = sellerPerformanceLast7DaysMap.get(order.sellerId);
                    sellerData.totalOrderCount++;
                    sellerPerformanceLast7DaysMap.set(order.sellerId, sellerData);
                }
            });
            const topSellersLast7Days = Array.from(sellerPerformanceLast7DaysMap.values())
                .sort((a, b) => b.totalSelling - a.totalSelling)
                .slice(0, 5);
            return {
                overall: {
                    totalOrders: stats.overall.total,
                    completedOrders: stats.overall.completed,
                    returnedOrders: stats.overall.returned,
                    otherOrders: stats.overall.others,
                    totalSelling: stats.overall.totalSelling,
                    totalCommission: stats.overall.totalCommission,
                    totalSellers,
                },
                last7Days: {
                    totalOrders: stats.last7Days.total,
                    completedOrders: stats.last7Days.completed,
                    returnedOrders: stats.last7Days.returned,
                    otherOrders: stats.last7Days.others,
                    totalSelling: stats.last7Days.totalSelling,
                    totalCommission: stats.last7Days.totalCommission,
                    activeSellers: activeSellersLast7Days,
                },
                topPerformers: {
                    overall: topSellers.map(seller => ({
                        sellerId: seller.sellerId,
                        sellerName: seller.sellerName,
                        sellerPhoneNo: seller.sellerPhoneNo,
                        totalSelling: seller.totalSelling,
                        totalCommission: seller.totalCommission,
                        completedOrderCount: seller.completedOrderCount,
                        totalOrderCount: seller.totalOrderCount,
                    })),
                    last7Days: topSellersLast7Days.map(seller => ({
                        sellerId: seller.sellerId,
                        sellerName: seller.sellerName,
                        sellerPhoneNo: seller.sellerPhoneNo,
                        totalSelling: seller.totalSelling,
                        totalCommission: seller.totalCommission,
                        completedOrderCount: seller.completedOrderCount,
                        totalOrderCount: seller.totalOrderCount,
                    })),
                },
            };
        });
    }
}
exports.default = new OrderServices();
