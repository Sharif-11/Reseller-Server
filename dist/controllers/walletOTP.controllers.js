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
const walletOTP_services_1 = __importDefault(require("../services/walletOTP.services"));
class WalletOtpController {
    /**
     * Send an OTP to a phone number
     */
    sendOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { phoneNo } = req.body;
                const userPhoneNo = (_a = req.user) === null || _a === void 0 ? void 0 : _a.mobileNo;
                if (phoneNo === userPhoneNo) {
                    res.status(200).json({
                        statusCode: 200,
                        message: 'phone number already verified',
                        success: true,
                        data: { otpVerified: true },
                    });
                }
                else {
                    const sendResponse = yield walletOTP_services_1.default.sendOtp(phoneNo);
                    res.status(200).json({
                        statusCode: 200,
                        message: 'OTP sent successfully',
                        success: true,
                        data: sendResponse,
                    });
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Verify an OTP for a phone number
     */
    verifyOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { phoneNo, otp } = req.body;
                const verifyResponse = yield walletOTP_services_1.default.verifyOtp(phoneNo, otp);
                res.status(200).json({
                    statusCode: 200,
                    message: verifyResponse.otpVerified
                        ? 'OTP verified successfully'
                        : 'OTP already verified',
                    success: true,
                    data: verifyResponse,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new WalletOtpController();
