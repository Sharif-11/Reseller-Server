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
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const sms_services_1 = __importDefault(require("./sms.services"));
const prisma_1 = __importDefault(require("../utils/prisma"));
class TransactionService {
    /**
     * ট্রানজেকশন আইডি চেক করার জন্য প্রাইভেট মেথড
     * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
     * @param transactionId - চেক করার ট্রানজেকশন আইডি
     * @throws ApiError যদি ট্রানজেকশন আইডি ইতিমধ্যে থাকে
     */
    checkExistingTransactionId(tx, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingTransaction = yield tx.transaction.findFirst({
                where: { transactionId },
            });
            if (existingTransaction) {
                throw new ApiError_1.default(400, 'এই ট্রানজেকশন আইডি ইতিমধ্যে ব্যবহৃত হয়েছে');
            }
        });
    }
    /**
     * লক সহ ইউজার ডেটা পাওয়ার জন্য প্রাইভেট মেথড
     * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
     * @param userId - ইউজার আইডি
     * @returns ইউজার ডেটা
     * @throws ApiError যদি ইউজার না পাওয়া যায়
     */
    getUserWithLock(tx, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // এক্সপ্লিসিট রো লকিং
            yield tx.$executeRaw `SELECT * FROM "users" WHERE "userId" = ${userId} FOR UPDATE`;
            const user = yield tx.user.findUnique({
                where: { userId },
                select: { balance: true, version: true, phoneNo: true, name: true, isLocked: true },
            });
            if (!user) {
                throw new ApiError_1.default(404, 'ব্যবহারকারী পাওয়া যায়নি');
            }
            return Object.assign(Object.assign({}, user), { balance: new decimal_js_1.default(user.balance) });
        });
    }
    /**
     * ইউজার ব্যালেন্স আপডেট করার প্রাইভেট মেথড
     * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
     * @param userId - ইউজার আইডি
     * @param currentVersion - বর্তমান ভার্সন
     * @param newBalance - নতুন ব্যালেন্স
     * @param isLocked - লক করা হবে কিনা
     * @throws ApiError যদি আপডেট ব্যর্থ হয়
     */
    updateUserBalance(tx_1, userId_1, currentVersion_1, newBalance_1) {
        return __awaiter(this, arguments, void 0, function* (tx, userId, currentVersion, newBalance, isLocked = false) {
            const updatedUser = yield tx.user.updateMany({
                where: {
                    userId,
                    version: currentVersion
                },
                data: {
                    balance: newBalance.toFixed(2),
                    isLocked,
                    version: { increment: 1 },
                },
            });
            if (updatedUser.count === 0) {
                throw new ApiError_1.default(409, 'ব্যবহারকারী আপডেট ব্যর্থ হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন');
            }
        });
    }
    /**
     * ট্রানজেকশন রেকর্ড তৈরি করার প্রাইভেট মেথড
     * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
     * @param params - ট্রানজেকশন প্যারামিটার
     * @returns তৈরি করা ট্রানজেকশন
     */
    createTransactionRecord(tx, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield tx.transaction.create({
                data: {
                    amount: params.amount.toFixed(2),
                    userId: params.userId,
                    userPhoneNo: params.userPhoneNo,
                    userName: params.userName,
                    type: params.type,
                    reason: params.reason,
                    paymentMethod: params.paymentMethod,
                    transactionId: params.transactionId,
                    paymentPhoneNo: params.paymentPhoneNo,
                    remarks: params.remarks,
                    reference: params.reference,
                    referralLevel: params.referralLevel,
                },
            });
        });
    }
    /**
     * ইউজারের ট্রানজেকশন ইতিহাস পাওয়ার মেথড
     * @param userId - ইউজার আইডি
     * @param page - পেজ নম্বর
     * @param pageSize - প্রতি পেজে আইটেম সংখ্যা
     * @returns ট্রানজেকশন লিস্ট এবং পেজিনেশন ডেটা
     */
    getTransactionOfUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, page = 1, pageSize = 10, }) {
            const [transactionList, total] = yield Promise.all([
                prisma_1.default.transaction.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    take: pageSize,
                    skip: (page - 1) * pageSize,
                }),
                prisma_1.default.transaction.count({ where: { userId } }),
            ]);
            return {
                transactionList,
                totalTransactions: total,
                currentPage: page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };
        });
    }
    /**
     * অ্যাডমিনের জন্য সব ট্রানজেকশন পাওয়ার মেথড
     * @param phoneNo - ফোন নম্বর দিয়ে ফিল্টার (ঐচ্ছিক)
     * @param page - পেজ নম্বর
     * @param pageSize - প্রতি পেজে আইটেম সংখ্যা
     * @returns ট্রানজেকশন লিস্ট এবং পেজিনেশন ডেটা
     */
    getAllTransactionForAdmin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ phoneNo, page = 1, pageSize = 10, }) {
            const [transactionList, total] = yield Promise.all([
                prisma_1.default.transaction.findMany({
                    where: {
                        userPhoneNo: phoneNo ? { contains: phoneNo } : undefined,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: pageSize,
                    skip: (page - 1) * pageSize,
                }),
                prisma_1.default.transaction.count({
                    where: {
                        userPhoneNo: phoneNo ? { contains: phoneNo } : undefined,
                    },
                }),
            ]);
            return {
                transactionList,
                totalTransactions: total,
                currentPage: page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };
        });
    }
    /**
     * ডিপোজিট যোগ করার মেথড
     * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
     * @param amount - যোগ করার পরিমাণ
     * @param userId - ইউজার আইডি
     * @param paymentMethod - পেমেন্ট মেথড
     * @param transactionId - ট্রানজেকশন আইডি
     * @param paymentPhoneNo - পেমেন্ট ফোন নম্বর
     * @returns তৈরি করা ট্রানজেকশন
     * @throws ApiError যদি পরিমাণ নেগেটিভ হয় বা ট্রানজেকশন আইডি ইতিমধ্যে থাকে
     */
    addDeposit(_a) {
        return __awaiter(this, arguments, void 0, function* ({ tx, amount, userId, paymentMethod, transactionId, paymentPhoneNo, }) {
            const decimalAmount = new decimal_js_1.default(amount);
            if (decimalAmount.isNegative()) {
                throw new ApiError_1.default(400, 'পরিমাণ নেগেটিভ হতে পারবে না');
            }
            yield this.checkExistingTransactionId(tx, transactionId);
            const user = yield this.getUserWithLock(tx, userId);
            const newBalance = user.balance.plus(decimalAmount);
            yield this.updateUserBalance(tx, userId, user.version, newBalance, newBalance.isNegative() ? user.isLocked : false);
            const transaction = yield this.createTransactionRecord(tx, {
                amount: decimalAmount,
                userId,
                userPhoneNo: user.phoneNo,
                userName: user.name,
                type: 'Credit',
                reason: 'জমা',
                paymentMethod,
                transactionId,
                paymentPhoneNo,
            });
            yield sms_services_1.default.sendMessage(user.phoneNo, `আপনার অ্যাকাউন্টে ${decimalAmount.toFixed(2)} টাকা যোগ করা হয়েছে। টিএক্সআইডি: ${transaction.transactionId}`);
            return transaction;
        });
    }
    /**
     * বকেয়া পরিশোধের মেথড
     * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
     * @param amount - পরিশোধের পরিমাণ
     * @param userId - ইউজার আইডি
     * @param transactionId - ট্রানজেকশন আইডি
     * @param paymentPhoneNo - পেমেন্ট ফোন নম্বর (ঐচ্ছিক)
     * @param paymentMethod - পেমেন্ট মেথড
     * @returns তৈরি করা ট্রানজেকশন
     * @throws ApiError যদি পরিমাণ নেগেটিভ হয় বা ট্রানজেকশন আইডি ইতিমধ্যে থাকে
     */
    compensateDue(_a) {
        return __awaiter(this, arguments, void 0, function* ({ tx, amount, userId, transactionId, paymentPhoneNo, paymentMethod, }) {
            const decimalAmount = new decimal_js_1.default(amount);
            if (decimalAmount.isNegative()) {
                throw new ApiError_1.default(400, 'পরিমাণ নেগেটিভ হতে পারবে না');
            }
            yield this.checkExistingTransactionId(tx, transactionId);
            const user = yield this.getUserWithLock(tx, userId);
            const newBalance = user.balance.plus(decimalAmount);
            yield this.updateUserBalance(tx, userId, user.version, newBalance, newBalance.isNegative() ? user.isLocked : false);
            const transaction = yield this.createTransactionRecord(tx, {
                amount: decimalAmount,
                userId,
                userPhoneNo: user.phoneNo,
                userName: user.name,
                type: 'Credit',
                reason: 'বকেয়া পরিশোধ',
                paymentMethod,
                transactionId,
                paymentPhoneNo,
            });
            return { transaction };
        });
    }
    /**
     * অর্ডার অ্যাপ্রুভালের জন্য ডেলিভারি চার্জ কাটার মেথড
     * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
     * @param amount - কাটার পরিমাণ
     * @param userId - ইউজার আইডি
     * @param transactionId - ট্রানজেকশন আইডি
     * @returns তৈরি করা ট্রানজেকশন
     * @throws ApiError যদি পরিমাণ নেগেটিভ হয় বা ব্যালেন্স কম থাকে
     */
    deductDeliveryChargeForOrderApproval(_a) {
        return __awaiter(this, arguments, void 0, function* ({ tx, amount, userId, }) {
            const decimalAmount = new decimal_js_1.default(amount);
            if (decimalAmount.isNegative()) {
                throw new ApiError_1.default(400, 'পরিমাণ নেগেটিভ হতে পারবে না');
            }
            const user = yield this.getUserWithLock(tx, userId);
            const newBalance = user.balance.minus(decimalAmount);
            yield this.updateUserBalance(tx, userId, user.version, newBalance);
            const transaction = yield this.createTransactionRecord(tx, {
                amount: decimalAmount,
                userId,
                userPhoneNo: user.phoneNo,
                userName: user.name,
                type: 'Debit',
                reason: 'অর্ডার ডিপোজিট চার্জ',
                remarks: 'অর্ডার অনুমোদনের জন্য ডেলিভারি চার্জ কাটা হয়েছে',
            });
            return { transaction };
        });
    }
    /**
     * অর্ডার ক্যান্সেলেশনের জন্য রিফান্ড করার মেথড
     * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
     * @param amount - রিফান্ডের পরিমাণ
     * @param userId - ইউজার আইডি
     * @param transactionId - ট্রানজেকশন আইডি
     * @param paymentPhoneNo - পেমেন্ট ফোন নম্বর (ঐচ্ছিক)
     * @param paymentMethod - পেমেন্ট মেথড
     * @param remarks - রিমার্কস (ঐচ্ছিক)
     * @returns তৈরি করা ট্রানজেকশন
     * @throws ApiError যদি পরিমাণ নেগেটিভ হয় বা ট্রানজেকশন আইডি ইতিমধ্যে থাকে
     */
    refundOrderCancellation(_a) {
        return __awaiter(this, arguments, void 0, function* ({ tx, amount, userId, remarks, }) {
            const decimalAmount = new decimal_js_1.default(amount);
            if (decimalAmount.isNegative()) {
                throw new ApiError_1.default(400, 'পরিমাণ নেগেটিভ হতে পারবে না');
            }
            const user = yield this.getUserWithLock(tx, userId);
            const newBalance = user.balance.plus(decimalAmount);
            yield this.updateUserBalance(tx, userId, user.version, newBalance, newBalance.isNegative() ? user.isLocked : false);
            const transaction = yield this.createTransactionRecord(tx, {
                amount: decimalAmount,
                userId,
                userPhoneNo: user.phoneNo,
                userName: user.name,
                type: 'Credit',
                reason: 'অর্ডার বাতিলের জন্য রিফান্ড',
                remarks,
            });
            return transaction;
        });
    }
    /**
     * Add Seller Commission
     * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
     * @param amount - কমিশনের পরিমাণ
     * @param userId - ইউজার আইডি
     * @returns তৈরি করা ট্রানজেকশন
     * @throws ApiError যদি পরিমাণ নেগেটিভ হয় বা ট্রানজেকশন আইডি ইতিমধ্যে থাকে
    
     */
    addSellerCommission(_a) {
        return __awaiter(this, arguments, void 0, function* ({ tx, amount, userId, userPhoneNo, userName }) {
            const decimalAmount = new decimal_js_1.default(amount);
            if (decimalAmount.isNegative()) {
                throw new ApiError_1.default(400, 'পরিমাণ নেগেটিভ হতে পারবে না');
            }
            const user = yield this.getUserWithLock(tx, userId);
            const newBalance = user.balance.plus(decimalAmount);
            yield this.updateUserBalance(tx, userId, user.version, newBalance, newBalance.isNegative() ? user.isLocked : false);
            const transaction = yield this.createTransactionRecord(tx, {
                amount: decimalAmount,
                userId,
                userPhoneNo: userPhoneNo,
                userName: userName,
                type: 'Credit',
                reason: 'বিক্রয় কমিশন',
            });
            return transaction;
        });
    }
    /**
     * Return Delivery Charge After Order Completion
     * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
     * @param amount - কমিশনের পরিমাণ
     * @param userId - ইউজার আইডি
     * @param userPhoneNo - ইউজার ফোন নম্বর
     * @param userName - ইউজার নাম
     * @returns তৈরি করা ট্রানজেকশন
     * @throws ApiError যদি পরিমাণ নেগেটিভ হয় বা ট্রানজেকশন আইডি ইতিমধ্যে থাকে
      */
    returnDeliveryChargeAfterOrderCompletion(_a) {
        return __awaiter(this, arguments, void 0, function* ({ tx, amount, userId, userPhoneNo, userName, }) {
            const decimalAmount = new decimal_js_1.default(amount);
            if (decimalAmount.isNegative()) {
                throw new ApiError_1.default(400, 'পরিমাণ নেগেটিভ হতে পারবে না');
            }
            const user = yield this.getUserWithLock(tx, userId);
            const newBalance = user.balance.plus(decimalAmount);
            yield this.updateUserBalance(tx, userId, user.version, newBalance, newBalance.isNegative() ? user.isLocked : false);
            const transaction = yield this.createTransactionRecord(tx, {
                amount: decimalAmount,
                userId,
                userPhoneNo: userPhoneNo,
                userName: userName,
                type: 'Credit',
                reason: 'ডেলিভারি চার্জ ফেরত',
            });
            return transaction;
        });
    }
    withdrawBalance(_a) {
        return __awaiter(this, arguments, void 0, function* ({ tx, amount, userId, transactionId, paymentPhoneNo, paymentMethod, remarks, }) {
            try {
                yield this.checkExistingTransactionId(tx, transactionId);
                const decimalAmount = new decimal_js_1.default(amount);
                if (decimalAmount.isNegative()) {
                    throw new ApiError_1.default(400, 'Amount can not be negative');
                }
                const user = yield tx.user.findUnique({
                    where: { userId },
                    select: { balance: true, version: true, phoneNo: true, name: true },
                });
                if (!user) {
                    throw new ApiError_1.default(404, 'ব্যবহারকারী পাওয়া যায়নি');
                }
                const { phoneNo: userPhoneNo, name: userName, balance, version: userVersion, } = user;
                // Ensure the user has enough balance
                const newBalance = new decimal_js_1.default(balance).minus(decimalAmount);
                if (newBalance.isNegative()) {
                    throw new ApiError_1.default(400, 'অপর্যাপ্ত ব্যালেন্স');
                }
                const updatedUser = yield tx.user.updateMany({
                    where: { userId, version: userVersion },
                    data: {
                        balance: newBalance.toFixed(2),
                        version: { increment: 1 },
                    },
                });
                if (updatedUser.count === 0) {
                    throw new ApiError_1.default(409, 'ব্যবহারকারী আপডেট করা যায়নি, অনুগ্রহ করে আবার চেষ্টা করুন');
                }
                // Create the transaction record
                const transaction = yield tx.transaction.create({
                    data: {
                        amount: decimalAmount.toFixed(2),
                        userId,
                        userPhoneNo,
                        userName,
                        paymentMethod,
                        transactionId,
                        paymentPhoneNo,
                        type: 'Debit',
                        reason: 'Withdraw',
                        remarks,
                    },
                });
                // check if transaction created successfully
                if (!transaction) {
                    throw new ApiError_1.default(500, 'লেনদেন সফলভাবে সম্পন্ন হয়নি');
                }
                return transaction;
            }
            catch (error) {
                throw new ApiError_1.default(500, (error === null || error === void 0 ? void 0 : error.message) || 'লেনদেন সফলভাবে সম্পন্ন হয়নি');
            }
        });
    }
}
exports.default = new TransactionService();
