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
const decimal_js_1 = __importDefault(require("decimal.js"));
const config_1 = __importDefault(require("../config"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const sms_services_1 = __importDefault(require("./sms.services"));
const transaction_services_1 = __importDefault(require("./transaction.services"));
const withdraw_utils_1 = require("../utils/withdraw.utils");
class WithdrawRequestServices {
    /**
     * Create a new withdraw request
     * @param {Object} data - The withdraw request data
     * @param {string} data.userId - User ID of the requester
     * @param {string} data.userPhoneNo - User's phone number
     * @param {string} data.userName - User's name
     * @param {number} data.amount - Withdrawal amount
     * @param {string} data.walletName - Wallet name
     * @param {string} data.walletPhoneNo - Wallet phone number
     * @param {string} [data.remarks] - Optional remarks
     * @returns {Object} - The created withdraw request
     */
    createRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, userPhoneNo, userName, amount, walletName, walletPhoneNo, remarks, }) {
            const decimalAmount = new decimal_js_1.default(amount);
            if (decimalAmount.isNaN() || decimalAmount.isNegative()) {
                throw new ApiError_1.default(400, 'Invalid amount.');
            }
            if (decimalAmount.isZero()) {
                throw new ApiError_1.default(400, 'Amount cannot be zero.');
            }
            // check if the amount exceed maximum limit
            if (decimalAmount.greaterThan(config_1.default.maximumWithdrawAmount)) {
                throw new ApiError_1.default(400, 'Amount exceeds the maximum limit.');
            }
            // check if the provide wallet name and wallet phone number is a valid one
            const wallet = yield prisma_1.default.wallet.findFirst({
                where: {
                    walletName,
                    walletPhoneNo,
                    userId,
                },
            });
            if (!wallet) {
                throw new ApiError_1.default(404, 'Wallet not found.');
            }
            // check if the user has enough balance
            const user = yield prisma_1.default.user.findUnique({
                where: { userId },
                select: { balance: true },
            });
            if (!user) {
                throw new ApiError_1.default(404, 'User not found.');
            }
            if (decimalAmount.greaterThan(user.balance)) {
                throw new ApiError_1.default(400, 'Insufficient balance.');
            }
            // Check if the user already has a pending request
            const existingRequest = yield prisma_1.default.withdrawRequest.findFirst({
                where: {
                    userId,
                    status: 'pending',
                },
            });
            if (existingRequest) {
                throw new ApiError_1.default(400, 'You already have a pending withdrawal request.');
            }
            const { actualAmount, transactionFee } = (0, withdraw_utils_1.calculateWithdrawal)({
                walletName,
                walletPhoneNo,
                amount: decimalAmount.toNumber(),
            });
            // Create a new request
            const newRequest = yield prisma_1.default.withdrawRequest.create({
                data: {
                    userId,
                    userPhoneNo,
                    userName,
                    amount: decimalAmount.toNumber(),
                    walletName,
                    walletPhoneNo,
                    remarks,
                    actualAmount,
                    transactionFee,
                },
            });
            return newRequest;
        });
    }
    /**
     * Get all withdraw requests of a user with optional pagination
     * @param {string} userId - User ID
     * @param {string} [status] - Optional filter by status
     * @param {number} [page=1] - Page number for pagination
     * @param {number} [pageSize=10] - Number of items per page
     * @returns {Object} - List of withdraw requests with pagination info
     */
    getUserRequests(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, status, page = 1, pageSize = 10, }) {
            const skip = (page - 1) * pageSize;
            const filter = {
                userId,
            };
            const [requests, totalRequests] = yield Promise.all([
                prisma_1.default.withdrawRequest.findMany({
                    where: {
                        userId,
                        status: {
                            in: status ? [status] : ['pending', 'completed', 'rejected'],
                        },
                    },
                    orderBy: {
                        requestedAt: 'desc',
                    },
                    skip,
                    take: pageSize,
                }),
                prisma_1.default.withdrawRequest.count({
                    where: filter,
                }),
            ]);
            return {
                requests,
                totalRequests,
                currentPage: page,
                totalPages: Math.ceil(totalRequests / pageSize),
            };
        });
    }
    /**
     * Cancel a withdraw request
     * @param {string} withdrawId - Withdraw request ID
     * @param {string} userId - User ID
     * @returns {Object} - The deleted withdraw request
     */
    cancelRequest(withdrawId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield prisma_1.default.withdrawRequest.findUnique({
                where: { withdrawId },
            });
            if (!request) {
                throw new ApiError_1.default(404, 'Withdrawal request not found.');
            }
            if (request.status !== 'pending') {
                throw new ApiError_1.default(400, 'Only pending requests can be canceled.');
            }
            const deletedRequest = yield prisma_1.default.withdrawRequest.delete({
                where: { withdrawId },
            });
            return deletedRequest;
        });
    }
    // get all withdraw requests with optional pagination, filter by status, and sorted by most recent requests
    getAllRequests(_a) {
        return __awaiter(this, arguments, void 0, function* ({ status, page = 1, pageSize = 10, }) {
            const skip = (page - 1) * pageSize;
            const [requests, totalRequests] = yield Promise.all([
                prisma_1.default.withdrawRequest.findMany({
                    where: {
                        status: {
                            in: status ? [status] : ['pending', 'completed', 'rejected'],
                        },
                    },
                    orderBy: {
                        requestedAt: 'desc',
                    },
                    skip,
                    take: pageSize,
                }),
                prisma_1.default.withdrawRequest.count({
                    where: {
                        status: {
                            in: status ? [status] : ['pending', 'completed', 'rejected'],
                        },
                    },
                }),
            ]);
            return {
                requests,
                totalRequests,
                currentPage: page,
                pageSize,
                totalPages: Math.ceil(totalRequests / pageSize),
            };
        });
    }
    // method to reject a withdraw request
    rejectRequest(withdrawId, remarks) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield prisma_1.default.withdrawRequest.findUnique({
                where: { withdrawId },
            });
            if (!request) {
                throw new ApiError_1.default(404, 'Withdrawal request not found.');
            }
            if (request.status !== 'pending') {
                throw new ApiError_1.default(400, 'Only pending requests can be rejected.');
            }
            const rejectedRequest = yield prisma_1.default.withdrawRequest.update({
                where: { withdrawId },
                data: {
                    status: 'rejected',
                    remarks,
                    processedAt: new Date(),
                },
            });
            return rejectedRequest;
        });
    }
    // method to complete a withdraw request
    completeRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ withdrawId, remarks, transactionId, transactionPhoneNo, userPhoneNo, }) {
            const request = yield prisma_1.default.withdrawRequest.findUnique({
                where: { withdrawId },
            });
            if (!request) {
                throw new ApiError_1.default(404, 'Withdrawal request not found.');
            }
            if (request.status !== 'pending') {
                throw new ApiError_1.default(400, 'Only pending requests can be completed.');
            }
            try {
                const completedRequest = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const updatedRequest = yield tx.withdrawRequest.update({
                            where: { withdrawId },
                            data: {
                                status: 'completed',
                                remarks,
                                transactionId,
                                processedAt: new Date(),
                            },
                        });
                        const transaction = yield transaction_services_1.default.withdrawBalance({
                            tx,
                            amount: new decimal_js_1.default(request.amount).toNumber(),
                            userId: request.userId,
                            remarks,
                            paymentMethod: request.walletName,
                            transactionId,
                            paymentPhoneNo: transactionPhoneNo,
                        });
                        return { updatedRequest, transaction };
                    }
                    catch (error) {
                        console.error('Error during transaction:', error);
                        throw error;
                    }
                }), { timeout: 5000 } // Set timeout to 10 seconds (10000 ms)
                );
                if (completedRequest) {
                    try {
                        yield sms_services_1.default.sendMessage(userPhoneNo, `${new decimal_js_1.default(request.amount)
                            .toNumber()
                            .toFixed(2)} টাকা সফলভাবে আপনার ${request.walletName}(${request.walletPhoneNo}) অ্যাকাউন্টে প্রেরণ করা হয়েছে। প্রেরক: ${transactionPhoneNo}। tnxId: ${transactionId}`);
                    }
                    catch (error) {
                        throw new ApiError_1.default(500, 'এসএমএস পাঠানো যায়নি');
                    }
                    return completedRequest;
                }
            }
            catch (error) {
                throw new ApiError_1.default(400, error.message || 'Failed to complete the request.');
            }
        });
    }
}
exports.default = new WithdrawRequestServices();
