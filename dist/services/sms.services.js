"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const ApiError_1 = __importStar(require("../utils/ApiError"));
class SmsServices {
    /**
     * Send OTP via SMS
     * @param mobileNo - The recipient's mobile number
     * @param otp - The OTP to be sent
     * @returns The response data from the SMS API
     */
    static sendOtp(mobileNo, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(this.BASE_URL, {
                    params: {
                        api_key: this.API_KEY,
                        type: 'text',
                        number: mobileNo,
                        senderid: this.SENDER_ID,
                        message: `আপনার ওটিপি কোডটি হলো: ${otp}। এই কোডটি অনুগ্রহ করে কাউকে জানাবেন না।`,
                    },
                });
                console.log('OTP SMS Response:', response.data);
                return this.handleSmsResponse(response.data);
            }
            catch (error) {
                console.error('Error sending OTP SMS:', error);
                throw new Error('Failed to send OTP via SMS');
            }
        });
    }
    /**
     * Send password via SMS
     * @param mobileNo - The recipient's mobile number
     * @param password - The password to be sent
     * @returns The response data from the SMS API
     */
    static sendPassword(mobileNo, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(this.BASE_URL, {
                    params: {
                        api_key: this.API_KEY,
                        type: 'text',
                        number: mobileNo,
                        senderid: this.SENDER_ID,
                        message: `আপনার পাসওয়ার্ডটি হলো: ${password}। এই পাসওয়ার্ডটি অনুগ্রহ করে কাউকে জানাবেন না।`,
                    },
                });
                return this.handleSmsResponse(response.data);
            }
            catch (error) {
                throw new Error('Failed to send Password via SMS');
            }
        });
    }
    static sendOrderNotificationToAdmin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ mobileNo, orderId, sellerName, sellerPhoneNo, customerName, customerPhoneNo, deliveryAddress, }) {
            const message = `নতুন অর্ডার এসেছে (অর্ডার আইডি: ${orderId})। বিক্রেতার নাম: ${sellerName}, ফোন নম্বর: ${sellerPhoneNo}, গ্রাহকের নাম: ${customerName}, ফোন নম্বর: ${customerPhoneNo}, ডেলিভারি ঠিকানা: ${deliveryAddress}`;
            return this.sendMessage(mobileNo, message);
        });
    }
    // A generic method to send any message via SMS
    static sendMessage(mobileNo, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(this.BASE_URL, {
                    params: {
                        api_key: this.API_KEY,
                        type: 'text',
                        number: mobileNo,
                        senderid: this.SENDER_ID,
                        message,
                    },
                });
                return this.handleSmsResponse(response.data);
            }
            catch (error) {
                console.error('Error sending Message SMS:', error);
                throw new ApiError_1.default(400, 'Failed to send Message via SMS');
            }
        });
    }
    static handleSmsResponse(response) {
        const { response_code, success_message, error_message } = response;
        const message = this.responseMessages[response_code] || 'Unknown error code';
        if (response_code === 202) {
            return success_message || message;
        }
        else {
            throw new ApiError_1.SmsServiceError(400, error_message || message);
        }
    }
}
SmsServices.API_KEY = config_1.default.apiKey;
SmsServices.SENDER_ID = config_1.default.senderId;
SmsServices.BASE_URL = config_1.default.smsUrl;
SmsServices.responseMessages = {
    202: 'SMS Submitted Successfully',
    1001: 'Invalid Number',
    1002: 'Sender ID not correct or disabled',
    1003: 'Required fields missing or contact system administrator',
    1005: 'Internal Error',
    1006: 'Balance validity not available',
    1007: 'Insufficient balance',
    1011: 'User ID not found',
    1012: 'Masking SMS must be sent in Bengali',
    1013: 'Sender ID not found by API key',
    1014: 'Sender type name not found using this sender by API key',
    1015: 'Sender ID has no valid gateway by API key',
    1016: 'Sender type name active price info not found by this sender ID',
    1017: 'Sender type name price info not found by this sender ID',
    1018: 'Account owner is disabled',
    1019: 'Sender type name price for this account is disabled',
    1020: 'Parent account not found',
    1021: 'Parent active sender type price for this account is not found',
    1031: 'Account not verified, please contact administrator',
    1032: 'IP not whitelisted',
};
exports.default = SmsServices;
