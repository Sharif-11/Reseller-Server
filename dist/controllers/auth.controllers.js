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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_services_1 = __importDefault(require("../services/auth.services"));
const otp_services_1 = __importDefault(require("../services/otp.services"));
const user_services_1 = __importDefault(require("../services/user.services"));
class AuthController {
    /**
     * Create a new Admin user
     */
    createAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminData = req.body;
                const newUser = yield auth_services_1.default.createAdmin(adminData);
                const { password } = newUser, user = __rest(newUser, ["password"]);
                res.status(201).json({
                    statusCode: 201,
                    message: 'অ্যাডমিন সফলভাবে তৈরি হয়েছে',
                    success: true,
                    data: user,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Create a new Seller user
     */
    createSeller(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sellerData = req.body;
                const newUser = yield auth_services_1.default.createSeller(sellerData);
                const { password } = newUser, user = __rest(newUser, ["password"]);
                res.status(201).json({
                    statusCode: 201,
                    message: 'সেলার সফলভাবে তৈরি হয়েছে',
                    success: true,
                    data: user,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Login user using phone number and password
     */
    loginWithPhoneNoAndPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { phoneNo, password } = req.body;
                const { user, token } = yield auth_services_1.default.loginWithPhoneNoAndPassword(phoneNo, password);
                const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
                res.cookie('token', token, { httpOnly: true });
                res.status(200).json({
                    statusCode: 200,
                    message: 'লগইন সফল',
                    success: true,
                    data: {
                        user: userWithoutPassword,
                        token,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie('token');
                res.status(200).json({
                    statusCode: 200,
                    message: 'লগআউট সফল',
                    success: true,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Send OTP for phone number verification
     */
    sendOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { phoneNo } = req.body;
                const data = yield otp_services_1.default.sendOtp(phoneNo);
                res.status(200).json({
                    statusCode: 200,
                    message: (data === null || data === void 0 ? void 0 : data.isVerified)
                        ? 'এই নম্বরটি ইতিমধ্যে যাচাই করা হয়েছে'
                        : 'OTP সফলভাবে পাঠানো হয়েছে',
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Verify OTP for phone number verification
     */
    verifyOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { phoneNo, otp } = req.body;
                const data = yield auth_services_1.default.verifyOtp(phoneNo, otp);
                res.status(200).json({
                    statusCode: 200,
                    message: data.otpVerified
                        ? 'OTP সফলভাবে যাচাই করা হয়েছে'
                        : 'এই নম্বরটি ইতিমধ্যে যাচাই করা হয়েছে',
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Update user profile information
     */
    updateProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const updates = req.body;
                const updatedUser = yield auth_services_1.default.updateProfile(userId, updates);
                const { password } = updatedUser, user = __rest(updatedUser, ["password"]);
                res.status(200).json({
                    statusCode: 200,
                    message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে',
                    success: true,
                    data: user,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Update user password
     */
    updatePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { currentPassword, newPassword } = req.body;
                const updatedUser = yield auth_services_1.default.updatePassword(userId, currentPassword, newPassword);
                const { password } = updatedUser, user = __rest(updatedUser, ["password"]);
                res.status(200).json({
                    statusCode: 200,
                    message: 'পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে',
                    success: true,
                    data: user,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Add referral code for the user
     */
    addReferralCode(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { referralCode } = req.body;
                const updatedUser = yield auth_services_1.default.addReferralCode(userId, referralCode);
                res.status(200).json({
                    statusCode: 200,
                    message: 'রেফারেল কোড সফলভাবে যোগ করা হয়েছে',
                    success: true,
                    data: updatedUser,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Get a specific user by phone number
     */
    getUserByPhoneNo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { phoneNo } = req.params;
                const user = yield auth_services_1.default.getUserByPhoneNo(phoneNo);
                res.status(200).json({
                    statusCode: 200,
                    message: 'ব্যবহারকারী সফলভাবে পাওয়া গেছে',
                    success: true,
                    data: user,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Get all users with optional filters
     */
    getAllUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { phoneNo, name } = req.query;
                const filters = {
                    phoneNo: phoneNo ? String(phoneNo) : undefined,
                    name: name ? String(name) : undefined,
                };
                const { page = 1, pageSize = 10 } = req.query;
                const users = yield auth_services_1.default.getAllUsers(filters, Number(page), Number(pageSize));
                res.status(200).json({
                    statusCode: 200,
                    message: 'সব ব্যবহারকারী সফলভাবে পাওয়া গেছে',
                    success: true,
                    data: users,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    forgotPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { phoneNo } = req.body;
                const data = yield auth_services_1.default.forgotPassword(phoneNo);
                res.status(200).json({
                    statusCode: 200,
                    message: 'নতুন পাসওয়ার্ড আপনার মোবাইল নম্বরে পাঠানো হয়েছে',
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // unlockUser controller method
    unlockUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { phoneNo } = req.body;
                const data = yield user_services_1.default.unlockUser(phoneNo);
                res.status(200).json({
                    statusCode: 200,
                    message: 'ব্যবহারকারী সফলভাবে আনলক করা হয়েছে',
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new AuthController();
