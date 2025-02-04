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
const prisma_1 = __importDefault(require("../utils/prisma"));
const contact_services_1 = __importDefault(require("./contact.services"));
const sms_services_1 = __importDefault(require("./sms.services"));
const utility_services_1 = __importDefault(require("./utility.services"));
class OtpServices {
    /**
     * Send an OTP to a phone number
     * @param phoneNo - The phone number to send the OTP to
     * @returns A response object indicating the OTP sending status and verification status
     */
    sendOtp(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            let contact = yield contact_services_1.default.getContactByPhoneNo(phoneNo);
            // console.log({ contact })
            if (!contact) {
                const otp = utility_services_1.default.generateOtp();
                contact = yield contact_services_1.default.createContact(phoneNo, otp);
                yield sms_services_1.default.sendOtp(phoneNo, otp);
                return { sendOTP: true, isBlocked: false, isVerified: false };
            }
            const user = yield prisma_1.default.user.findUnique({
                where: { phoneNo },
            });
            if (user) {
                throw new ApiError_1.default(400, 'ফোন নম্বরটি ইতিমধ্যে একটি ব্যবহারকারীর সাথে যুক্ত।');
            }
            if (contact.isVerified) {
                return { isVerified: true, isBlocked: false, sendOTP: false };
            }
            if (contact.isBlocked) {
                throw new ApiError_1.default(403, 'অতিরিক্ত ওটিপি অনুরোধের কারণে এই কন্টাক্টটি ব্লক করা হয়েছে।');
            }
            if (contact.totalOTP >= config_1.default.maximumOtpAttempts) {
                yield contact_services_1.default.blockContact(phoneNo);
                throw new ApiError_1.default(403, 'বহুবার ওটিপি অনুরোধ করার কারণে কন্টাক্টটি ব্লক করা হয়েছে।');
            }
            const otp = utility_services_1.default.generateOtp();
            yield contact_services_1.default.updateContact(phoneNo, otp);
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
            const contact = yield contact_services_1.default.getContactByPhoneNo(phoneNo);
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
            yield contact_services_1.default.verifyContact(phoneNo);
            return { otpVerified: true };
        });
    }
}
exports.default = new OtpServices();
