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
class TransactionService {
    checkExistingTransactionId(tx, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingTransaction = yield tx.transaction.findFirst({
                where: { transactionId },
            });
            if (existingTransaction) {
                throw new ApiError_1.default(400, 'Transaction ID already exists');
            }
        });
    }
    /**
     * Adds a deposit to the user's account.
     *
     * @param {Object} params - The parameters for the deposit.
     * @param {number} params.amount - The amount to be deposited. This value cannot be negative.
     * @param {string} params.userId - The ID of the user making the deposit.
     * @param {string} params.paymentMethod - The method of payment used for the deposit.
     * @param {string} params.transactionId - The transaction ID associated with the deposit.
     * @param {string} params.paymentPhoneNo - The phone number used for the payment.
     * @returns {Promise<Object>} The transaction object created.
     * @throws {ApiError} If the amount is negative, the user does not exist, or any other error occurs during the transaction.
     */
    addDeposit({ tx, amount, userId, paymentMethod, transactionId, paymentPhoneNo, }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkExistingTransactionId(tx, transactionId);
            const decimalAmount = new decimal_js_1.default(amount);
            if (decimalAmount.isNegative()) {
                throw new ApiError_1.default(400, 'Amount can not be negative');
            }
            // check transactionId is unique
            const user = yield tx.user.findUnique({
                where: { userId },
                select: { balance: true, version: true, phoneNo: true, name: true },
            });
            if (!user) {
                throw new ApiError_1.default(404, 'ব্যবহারকারী পাওয়া যায়নি');
            }
            const { phoneNo: userPhoneNo, name: userName, balance, version: userVersion, } = user;
            // Use optimistic locking by verifying version
            const newBalance = new decimal_js_1.default(balance).plus(decimalAmount);
            const updatedUser = yield tx.user.updateMany({
                where: { userId, version: userVersion },
                data: {
                    balance: newBalance.toFixed(2),
                    isLocked: newBalance.isNegative(),
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
                    type: 'Credit',
                    reason: 'Deposit',
                },
            });
            yield sms_services_1.default.sendMessage(userPhoneNo, `${decimalAmount.toFixed(2)} টাকা আপনার ব্যালেন্সে যোগ করা হয়েছে। tnxId: ${transaction.transactionId}`);
            return transaction;
        });
    }
    withdrawBalance({ tx, amount, userId, transactionId, paymentPhoneNo, paymentMethod, remarks, }) {
        return __awaiter(this, void 0, void 0, function* () {
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
    addSellCommision({ tx, amount, userId, }) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const { phoneNo: userPhoneNo, name: userName, version: userVersion } = user;
            // Add the commission to the user's balance
            const newBalance = new decimal_js_1.default(user.balance).plus(decimalAmount);
            const updatedUser = yield tx.user.updateMany({
                where: { userId, version: userVersion },
                data: {
                    balance: newBalance.toFixed(2),
                    isLocked: newBalance.isNegative(),
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
                    type: 'Credit',
                    reason: 'Sell Commission',
                },
            });
            yield sms_services_1.default.sendMessage(userPhoneNo, `আপনার অ্যাকাউন্টে বিক্রয় কমিশন হিসেবে ${decimalAmount.toFixed(2)} টাকা যোগ করা হয়েছে। tnxId: ${transaction.transactionId}`);
            return transaction;
        });
    }
    addTeamCommision({ tx, amount, userId, reference, referralLevel, }) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const { phoneNo: userPhoneNo, name: userName, version: userVersion } = user;
            // Add the commission to the user's balance
            const newBalance = new decimal_js_1.default(user.balance).plus(decimalAmount);
            const updatedUser = yield tx.user.updateMany({
                where: { userId, version: userVersion },
                data: {
                    balance: newBalance.toFixed(2),
                    isLocked: newBalance.isNegative(),
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
                    type: 'Credit',
                    reason: 'Team Commission',
                    reference,
                    referralLevel,
                },
            });
            yield sms_services_1.default.sendMessage(userPhoneNo, `আপনার রেফারেল এর একজন ব্যবহারকারী সফলভাবে একটি পণ্য ডেলিভারি করেছেন। 
      আপনার অ্যাকাউন্টে টিম কমিশন হিসেবে ${decimalAmount.toFixed(2)} টাকা যোগ করা হয়েছে। tnxId: ${transaction.transactionId}`);
            return transaction;
        });
    }
    deductDeliveryCharge({ tx, amount, userId, remarks, }) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    type: 'Debit',
                    reason: 'Delivery Charge deduction due to returned product',
                    remarks,
                },
            });
            yield sms_services_1.default.sendMessage(userPhoneNo, `আপনার অর্ডার করা পণ্যটি ফেরত দেওয়া হয়েছে। ডেলিভারি চার্জ হিসেবে আপনার অ্যাকাউন্ট থেকে ${decimalAmount.toFixed(2)} টাকা কাটা হয়েছে। tnxId: ${transaction.transactionId}`);
        });
    }
    deductSmsChargeForForgotPassword({ tx, amount, userId, remarks, }) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    type: 'Debit',
                    reason: 'SMS Charge deduction for forgot password',
                    remarks,
                },
            });
            yield sms_services_1.default.sendMessage(userPhoneNo, `আপনার পাসওয়ার্ড পুনরুদ্ধারের জন্য এসএমএস চার্জ হিসেবে আপনার অ্যাকাউন্ট থেকে ${decimalAmount.toFixed(2)} টাকা কাটা হয়েছে। tnxId: ${transaction.transactionId}`);
        });
    }
}
exports.default = new TransactionService();
