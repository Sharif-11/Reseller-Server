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
const payment_services_1 = __importDefault(require("../services/payment.services"));
class PaymentController {
    createDuePayment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { amount, transactionId, adminWalletId, sellerWalletName, sellerWalletPhoneNo, } = req.body;
                const newPayment = yield payment_services_1.default.createDuePaymentRequest({
                    amount,
                    transactionId: String(transactionId).trim(),
                    sellerWalletName,
                    sellerWalletPhoneNo,
                    adminWalletId,
                    sellerId: userId,
                });
                res.status(axios_1.HttpStatusCode.Created).json({
                    success: true,
                    message: 'Payment request created successfully',
                    data: newPayment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyDuePaymentRequest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { paymentId } = req.params;
                const payment = yield payment_services_1.default.verifyDuePaymentRequest({
                    paymentId: Number(paymentId),
                    amount: req.body.amount,
                    transactionId: req.body.transactionId,
                });
                res.status(axios_1.HttpStatusCode.Accepted).json({
                    statusCode: axios_1.HttpStatusCode.Accepted,
                    success: true,
                    message: 'Payment request verified successfully',
                    data: payment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllPaymentsOfASeller(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { page, limit, status } = req.query;
                const payments = yield payment_services_1.default.getAllPaymentsOfASeller({
                    userId: userId,
                    page: Number(page) || 1,
                    limit: Number(limit) || 10,
                    status: status,
                });
                res.status(axios_1.HttpStatusCode.Ok).json({
                    statusCode: axios_1.HttpStatusCode.Ok,
                    success: true,
                    message: 'Payments fetched successfully',
                    data: payments,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllPaymentsForAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, limit, status } = req.query;
                const payments = yield payment_services_1.default.getAllPaymentsForAdmin({
                    page: Number(page) || 1,
                    limit: Number(limit) || 10,
                    status: status,
                });
                res.status(axios_1.HttpStatusCode.Ok).json({
                    statusCode: axios_1.HttpStatusCode.Ok,
                    success: true,
                    message: 'Payments fetched successfully',
                    data: payments,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    rejectPaymentRequest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { paymentId } = req.params;
                const { remarks } = req.body;
                const payment = yield payment_services_1.default.rejectPaymentRequest({
                    paymentId: Number(paymentId),
                    remarks,
                });
                res.status(axios_1.HttpStatusCode.Accepted).json({
                    statusCode: axios_1.HttpStatusCode.Accepted,
                    success: true,
                    message: 'Payment request rejected successfully',
                    data: payment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new PaymentController();
