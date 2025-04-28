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
const user_services_1 = __importDefault(require("./user.services"));
const wallet_services_1 = __importDefault(require("./wallet.services"));
class PaymentService {
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
                },
            });
            return duePaymentRequest;
        });
    }
    createOrderPaymentRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ tx, amount, transactionId, sellerWalletName, sellerWalletPhoneNo, sellerName, sellerPhoneNo, adminWalletId, adminWalletName, adminWalletPhoneNo, orderId, }) {
            const orderPaymentRequest = yield tx.payment.create({
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
                    orderId,
                    sender: 'Seller',
                    paymentType: 'OrderPayment',
                },
            });
            return orderPaymentRequest;
        });
    }
    createWithdrawPaymentRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ tx, amount, transactionId, sellerWalletName, sellerWalletPhoneNo, sellerName, sellerPhoneNo, adminWalletId, adminWalletName, adminWalletPhoneNo, }) {
            const withdrawPaymentRequest = yield tx.payment.create({
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
                    sender: 'Admin',
                    paymentType: 'WithdrawPayment',
                    paymentStatus: 'verified',
                },
            });
            return withdrawPaymentRequest;
        });
    }
    verifyPaymentRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ tx, paymentId, amount, transactionId, }) {
            const existingPayment = yield (tx || prisma_1.default).payment.findUnique({
                where: { paymentId },
            });
            if (!existingPayment) {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'Payment request not found');
            }
            if (existingPayment.paymentStatus !== 'pending') {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'Only pending payment requests can be verified');
            }
            if (transactionId !== existingPayment.transactionId) {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'Transaction ID does not match the existing payment request');
            }
            const updatedPayment = yield (tx || prisma_1.default).payment.update({
                where: { paymentId },
                data: {
                    paymentStatus: 'verified',
                    amount,
                },
            });
            return updatedPayment;
        });
    }
    rejectPaymentRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ tx, paymentId, }) {
            const existingPayment = yield tx.payment.findUnique({
                where: { paymentId },
            });
            if (!existingPayment) {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'Payment request not found');
            }
            if (existingPayment.paymentStatus !== 'pending') {
                throw new ApiError_1.default(axios_1.HttpStatusCode.BadRequest, 'Only pending payment requests can be rejected');
            }
            return yield tx.payment.update({
                where: { paymentId },
                data: {
                    paymentStatus: 'rejected',
                    transactionId: null,
                },
            });
        });
    }
}
exports.default = new PaymentService();
