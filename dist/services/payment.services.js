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
const axios_1 = require("axios");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const transaction_services_1 = __importDefault(require("./transaction.services"));
const user_services_1 = __importDefault(require("./user.services"));
const wallet_services_1 = __importDefault(require("./wallet.services"));
class PaymentService {
    checkTransactionIdExists(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingTransaction = yield prisma_1.default.payment.findUnique({
                where: { transactionId },
            });
            if (existingTransaction) {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'এই ট্রানজেকশন আইডি ইতিমধ্যে ব্যবহৃত হয়েছে');
            }
        });
    }
    createDuePaymentRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ adminWalletId, amount, transactionId, sellerWalletName, sellerWalletPhoneNo, sellerId, }) {
            const adminWallet = yield wallet_services_1.default.getWalletById(adminWalletId);
            if (!adminWallet) {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'Admin wallet not found');
            }
            const adminWalletName = adminWallet.walletName;
            const adminWalletPhoneNo = adminWallet.walletPhoneNo;
            const seller = yield user_services_1.default.getUserByUserId(sellerId);
            if (!seller) {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'Seller not found');
            }
            const sellerName = seller.name;
            const sellerPhoneNo = seller.phoneNo;
            //check unique transactionId
            yield this.checkTransactionIdExists(transactionId);
            const existingPaymentRequest = yield prisma_1.default.payment.findFirst({
                where: {
                    sellerId,
                    paymentType: 'DuePayment',
                    paymentStatus: 'pending',
                },
            });
            if (existingPaymentRequest) {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'Pending payment request already exists for this seller');
            }
            const duePaymentRequest = yield prisma_1.default.payment.create({
                data: {
                    amount,
                    transactionId,
                    sellerWalletName,
                    sellerWalletPhoneNo,
                    sellerName,
                    sellerPhoneNo,
                    adminWalletId,
                    adminWalletName,
                    adminWalletPhoneNo,
                    sender: 'Seller',
                    paymentType: 'DuePayment',
                    sellerId,
                    actualAmount: amount,
                },
            });
            return duePaymentRequest;
        });
    }
    createOrderPaymentRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ tx, amount, transactionId, sellerWalletName, sellerWalletPhoneNo, sellerName, sellerPhoneNo, adminWalletId, adminWalletName, adminWalletPhoneNo, orderId, sellerId, }) {
            yield this.checkTransactionIdExists(transactionId);
            const orderPaymentRequest = yield tx.payment.create({
                data: {
                    amount,
                    actualAmount: amount,
                    transactionId,
                    sellerWalletName,
                    sellerWalletPhoneNo,
                    sellerName,
                    sellerPhoneNo,
                    adminWalletId,
                    adminWalletName,
                    adminWalletPhoneNo,
                    orderId,
                    sender: 'Seller',
                    paymentType: 'OrderPayment',
                    sellerId,
                },
            });
            return orderPaymentRequest;
        });
    }
    createWithdrawPaymentRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ tx, amount, transactionId, sellerWalletName, sellerWalletPhoneNo, sellerName, sellerPhoneNo, adminWalletName, adminWalletPhoneNo, sellerId, withdrawId, actualAmount, transactionFee, }) {
            yield this.checkTransactionIdExists(transactionId);
            const withdrawPaymentRequest = yield tx.payment.create({
                data: {
                    amount,
                    transactionId,
                    sellerWalletName,
                    sellerWalletPhoneNo,
                    sellerName,
                    sellerPhoneNo,
                    adminWalletName,
                    adminWalletPhoneNo,
                    sender: 'Admin',
                    paymentType: 'WithdrawPayment',
                    paymentStatus: 'verified',
                    sellerId,
                    withdrawId,
                    actualAmount,
                    transactionFee,
                },
            });
            return withdrawPaymentRequest;
        });
    }
    verifyDuePaymentRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ paymentId, amount, transactionId, }) {
            const existingPayment = yield prisma_1.default.payment.findUnique({
                where: { paymentId, paymentType: 'DuePayment' },
            });
            if (!existingPayment) {
                throw new ApiError_1.default(axios_1.HttpStatusCode.NotFound, 'পেমেন্ট অনুরোধ পাওয়া যায়নি');
            }
            if (existingPayment.paymentStatus !== 'pending') {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'শুধুমাত্র অমীমাংসিত পেমেন্ট অনুরোধগুলি যাচাই করা যেতে পারে');
            }
            if (transactionId !== existingPayment.transactionId) {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'ট্রানজেকশন আইডি  মিলছে না');
            }
            // here we need to verify the payment along with adding the balance to the seller wallet within a transaction
            const payment = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const updatedPayment = yield tx.payment.update({
                    where: { paymentId },
                    data: {
                        paymentStatus: 'verified',
                        transactionId,
                        actualAmount: amount,
                        processedAt: new Date(),
                    },
                });
                const updatedUser = yield transaction_services_1.default.compensateDue({
                    tx,
                    amount: Number(updatedPayment.amount),
                    userId: updatedPayment.sellerId,
                    transactionId: String(updatedPayment.transactionId),
                    paymentPhoneNo: updatedPayment.sellerWalletPhoneNo,
                    paymentMethod: updatedPayment.sellerWalletName,
                });
                return { updatedPayment, updatedUser };
            }));
            return payment.updatedPayment;
        });
    }
    verifyOrderPaymentRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ paymentId, transactionId, amount, }) {
            const existingPayment = yield prisma_1.default.payment.findUnique({
                where: { paymentId, paymentType: 'OrderPayment' },
            });
            if (!existingPayment) {
                throw new ApiError_1.default(axios_1.HttpStatusCode.NotFound, 'পেমেন্ট অনুরোধ পাওয়া যায়নি');
            }
            if (existingPayment.paymentStatus !== 'pending') {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'শুধুমাত্র অমীমাংসিত পেমেন্ট অনুরোধগুলি যাচাই করা যেতে পারে');
            }
            if (transactionId !== existingPayment.transactionId) {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'ট্রানজেকশন আইডি  মিলছে না');
            }
            // we need to make the payment verified and also update the transactionVerified field of the order
            const payment = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const updatedPayment = yield tx.payment.update({
                    where: { paymentId },
                    data: {
                        paymentStatus: 'verified',
                        transactionId,
                        actualAmount: amount,
                        processedAt: new Date(),
                    },
                });
                const updatedOrder = yield tx.order.update({
                    where: { orderId: updatedPayment.orderId },
                    data: {
                        transactionVerified: true,
                        orderStatus: 'pending',
                    },
                });
                if (updatedOrder.deliveryCharge.toNumber() > amount) {
                    throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'Amount is less than delivery charge');
                }
                return { updatedPayment, updatedOrder };
            }));
        });
    }
    rejectPaymentRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ tx, paymentId, remarks, }) {
            const existingPayment = yield (tx || prisma_1.default).payment.findUnique({
                where: { paymentId },
            });
            if (!existingPayment) {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'Payment request not found');
            }
            if (existingPayment.paymentStatus !== 'pending') {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'Only pending payment requests can be rejected');
            }
            return yield (tx || prisma_1.default).payment.update({
                where: { paymentId },
                data: {
                    paymentStatus: 'rejected',
                    transactionId: null,
                    remarks,
                },
            });
        });
    }
    rejectOrderPaymentRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ paymentId, remarks, }) {
            const existingPayment = yield prisma_1.default.payment.findUnique({
                where: { paymentId, paymentType: 'OrderPayment' },
            });
            if (!existingPayment) {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'Payment request not found');
            }
            if (existingPayment.paymentStatus !== 'pending') {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'Only pending payment requests can be rejected');
            }
            // we need to make the payment rejected and also update the orderStatus to rejected and make transaction id null
            const payment = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const updatedPayment = yield tx.payment.update({
                    where: { paymentId },
                    data: {
                        paymentStatus: 'rejected',
                        transactionId: null,
                        remarks,
                    },
                });
                const updatedOrder = yield tx.order.update({
                    where: { orderId: existingPayment.orderId },
                    data: {
                        orderStatus: 'rejected',
                        transactionVerified: false,
                    },
                });
                return { updatedPayment, updatedOrder };
            }));
        });
    }
    getAllPaymentsOfASeller(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, page, limit, status, }) {
            const payments = yield prisma_1.default.payment.findMany({
                where: Object.assign({ sellerId: userId }, (status && { paymentStatus: status })),
                orderBy: { paymentDate: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            });
            const totalPayments = yield prisma_1.default.payment.count({
                where: { sellerId: userId },
            });
            return {
                payments,
                totalPayments,
                currentPage: page,
                totalPages: Math.ceil(totalPayments / limit),
            };
        });
    }
    getAllPaymentsForAdmin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page, limit, status, }) {
            const payments = yield prisma_1.default.payment.findMany({
                where: Object.assign({}, (status && { paymentStatus: status })),
                orderBy: { paymentDate: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            });
            const totalPayments = yield prisma_1.default.payment.count();
            return {
                payments,
                totalPayments,
                currentPage: page,
                totalPages: Math.ceil(totalPayments / limit),
            };
        });
    }
}
exports.default = new PaymentService();
