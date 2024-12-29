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
const auth_services_1 = __importDefault(require("../services/auth.services"));
const utility_services_1 = __importDefault(require("../services/utility.services"));
class AuthController {
    sendOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { mobileNo } = req.body;
                const result = yield auth_services_1.default.sendOtp(mobileNo);
                res.status(200).json({
                    statusCode: 200,
                    success: true,
                    message: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { mobileNo, otp } = req.body;
                const result = yield auth_services_1.default.verifyOtp(mobileNo, otp);
                res.status(200).json({
                    statusCode: 200,
                    success: true,
                    message: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { mobileNo, password } = req.body;
                const result = yield auth_services_1.default.login({ mobileNo, password });
                //set cookie
                res.cookie('token', result.accessToken, {
                    httpOnly: true,
                });
                res.status(200).json({
                    statusCode: 200,
                    success: true,
                    message: 'Login successful',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { mobileNo, password, zilla, address, name, email, } = req.body;
                const result = yield auth_services_1.default.createAdmin({
                    mobileNo,
                    password,
                    zilla,
                    name,
                    address,
                    email,
                });
                res.status(201).json({
                    statusCode: 201,
                    success: true,
                    message: 'Admin created successfully',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createSeller(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { mobileNo, password, zilla, address, name, email, } = req.body;
                const result = yield auth_services_1.default.createSeller({
                    mobileNo,
                    password,
                    zilla,
                    name,
                    address,
                    email,
                });
                res.status(201).json({
                    statusCode: 201,
                    success: true,
                    message: 'Seller created successfully',
                    data: result,
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
                    success: true,
                    message: 'Logout successful',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { name, email, address, zilla } = req.body;
                const result = yield auth_services_1.default.updateProfile(userId, {
                    userId,
                    name,
                    email,
                    address,
                    zilla,
                });
                res.status(200).json({
                    statusCode: 200,
                    success: true,
                    message: 'Profile updated successfully',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    changePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { oldPassword, newPassword } = req.body;
                const result = yield auth_services_1.default.changePassword(userId, {
                    oldPassword,
                    newPassword,
                });
                res.status(200).json({
                    statusCode: 200,
                    success: true,
                    message: result,
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
                const { mobileNo } = req.body;
                const newPassword = utility_services_1.default.generateOtp();
                const result = yield auth_services_1.default.forgotPassword(mobileNo, newPassword);
                yield utility_services_1.default.sendSms(mobileNo, newPassword);
                res.status(200).json({
                    statusCode: 200,
                    success: true,
                    message: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new AuthController();
