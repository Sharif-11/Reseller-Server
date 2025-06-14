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
const config_1 = __importDefault(require("../config"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const sms_services_1 = __importDefault(require("./sms.services"));
const user_services_1 = __importDefault(require("./user.services"));
const utility_services_1 = __importDefault(require("./utility.services"));
const walletContact_services_1 = __importDefault(require("./walletContact.services"));
class WalletOtpServices {
    /**
     * Send an OTP to a phone number
     * @param phoneNo - The phone number to send the OTP to
     * @returns A response object indicating the OTP sending status and verification status
     */
    sendOtp(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield user_services_1.default.getUserByPhoneNo(phoneNo);
            if (existingUser) {
                throw new ApiError_1.default(400, 'এই ফোন নম্বরটি ইতিমধ্যে একটি ব্যবহারকারীর সাথে যুক্ত।');
            }
            let contact = yield walletContact_services_1.default.getWalletContactByPhoneNo(phoneNo);
            // console.log({ contact })
            if (!contact) {
                const otp = utility_services_1.default.generateOtp();
                contact = yield walletContact_services_1.default.createWalletContact(phoneNo, otp);
                yield sms_services_1.default.sendOtp(phoneNo, otp);
                return { sendOTP: true, isBlocked: false, isVerified: false };
            }
            if (contact.isVerified) {
                return { alreadyVerified: true, isBlocked: false, sendOTP: false };
            }
            if (contact.isBlocked) {
                throw new ApiError_1.default(403, 'অতিরিক্ত ওটিপি অনুরোধের কারণে এই কন্টাক্টটি ব্লক করা হয়েছে।');
            }
            if (contact === null || contact === void 0 ? void 0 : contact.otpCreatedAt) {
                const timeSinceLastOtp = Date.now() - contact.otpCreatedAt.getTime();
                if (timeSinceLastOtp < config_1.default.otpExpiresIn) {
                    const timeLeft = Math.ceil((config_1.default.otpExpiresIn - timeSinceLastOtp) / 1000);
                    return {
                        sendOTP: false,
                        alreadySent: true,
                        isBlocked: false,
                        isVerified: false,
                        message: `ইতিমধ্যে একটি ওটিপি পাঠানো হয়েছে। অনুগ্রহ করে ${timeLeft} সেকেন্ড পরে আবার চেষ্টা করুন।`,
                    };
                }
            }
            if (contact.totalOTP >= config_1.default.maximumOtpAttempts) {
                yield walletContact_services_1.default.blockWalletContact(phoneNo);
                throw new ApiError_1.default(403, 'বহুবার ওটিপি অনুরোধ করার কারণে কন্টাক্টটি ব্লক করা হয়েছে।');
            }
            const otp = utility_services_1.default.generateOtp();
            yield walletContact_services_1.default.updateWalletContact(phoneNo, otp);
            yield sms_services_1.default.sendOtp(phoneNo, otp);
            return { sendOTP: true, isBlocked: false, isVerified: false };
        });
    }
    /**
     * Verify an OTP for a phone number
     * @param phoneNo - The phone number associated with the OTP
     * @param otp - The OTP to verify
     * @returns An object indicating OTP verification status
     */
    verifyOtp(phoneNo, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const contact = yield walletContact_services_1.default.getWalletContactByPhoneNo(phoneNo);
            if (!contact) {
                throw new ApiError_1.default(404, 'কন্টাক্ট পাওয়া যায়নি।');
            }
            if (!contact.otp || !contact.otpCreatedAt) {
                throw new ApiError_1.default(400, 'ওটিপি পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
            }
            if (contact.isVerified) {
                return { alreadyVerified: true };
            }
            const otpExpiryTime = new Date(contact.otpCreatedAt.getTime() + config_1.default.otpExpiresIn);
            if (new Date() > otpExpiryTime) {
                throw new ApiError_1.default(400, 'ওটিপি মেয়াদোত্তীর্ণ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
            }
            if (contact.otp !== otp) {
                throw new ApiError_1.default(400, 'ওটিপি সঠিক নয়।');
            }
            // Mark contact as verified
            yield walletContact_services_1.default.verifyWalletContact(phoneNo);
            return { otpVerified: true };
        });
    }
}
exports.default = new WalletOtpServices();
