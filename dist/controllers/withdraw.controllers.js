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
const withdraw_services_1 = __importDefault(require("../services/withdraw.services"));
const prisma_1 = __importDefault(require("../utils/prisma"));
class WithdrawRequestController {
    /**
     * Create a new withdraw request
     */
    createRequest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const userPhoneNo = (_b = req.user) === null || _b === void 0 ? void 0 : _b.mobileNo;
                const user = yield prisma_1.default.user.findUnique({
                    where: { userId },
                });
                const { amount, walletName, walletPhoneNo } = req.body;
                console.log({
                    amount,
                    walletName,
                    walletPhoneNo,
                    user: { userId, userPhoneNo, name: user === null || user === void 0 ? void 0 : user.name },
                });
                const newRequest = yield withdraw_services_1.default.createRequest({
                    userId,
                    userPhoneNo,
                    userName: user === null || user === void 0 ? void 0 : user.name,
                    amount,
                    walletName,
                    walletPhoneNo,
                });
                res.status(201).json({
                    statusCode: 201,
                    success: true,
                    message: 'Withdrawal request created successfully.',
                    data: newRequest,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Get all withdrawal requests for a user with optional pagination and filtering by status
     */
    getUserRequests(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { status, page, pageSize } = req.query;
                const requests = yield withdraw_services_1.default.getUserRequests({
                    userId,
                    status,
                    page: Number(page) || 1,
                    pageSize: Number(pageSize) || 10,
                });
                res.status(200).json({
                    statusCode: 200,
                    success: true,
                    message: 'Withdrawal requests retrieved successfully.',
                    data: requests,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Cancel a withdrawal request
     */
    cancelRequest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { withdrawId } = req.params;
                const canceledRequest = yield withdraw_services_1.default.cancelRequest(withdrawId);
                res.status(200).json({
                    statusCode: 200,
                    success: true,
                    message: 'Withdrawal request canceled successfully.',
                    data: canceledRequest,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Get all withdrawal requests with optional pagination and filtering by status
     */
    getAllRequests(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, page, pageSize } = req.query;
                const requests = yield withdraw_services_1.default.getAllRequests({
                    status: status,
                    page: Number(page) || 1,
                    pageSize: Number(pageSize) || 10,
                });
                res.status(200).json({
                    statusCode: 200,
                    success: true,
                    message: 'All withdrawal requests retrieved successfully.',
                    data: requests,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Reject a withdrawal request
     */
    rejectRequest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { withdrawId } = req.params;
                const { remarks } = req.body;
                const rejectedRequest = yield withdraw_services_1.default.rejectRequest(withdrawId, remarks);
                res.status(200).json({
                    statusCode: 200,
                    success: true,
                    message: 'Withdrawal request rejected successfully.',
                    data: rejectedRequest,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Complete a withdrawal request
     */
    completeRequest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { withdrawId } = req.params;
                const phoneNo = (_a = req.user) === null || _a === void 0 ? void 0 : _a.mobileNo;
                const { remarks, transactionId, transactionPhoneNo } = req.body;
                const completedRequest = yield withdraw_services_1.default.completeRequest({
                    withdrawId,
                    remarks,
                    transactionId,
                    transactionPhoneNo,
                    userPhoneNo: phoneNo,
                });
                res.status(200).json({
                    success: true,
                    message: 'Withdrawal request completed successfully.',
                    data: completedRequest,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new WithdrawRequestController();
