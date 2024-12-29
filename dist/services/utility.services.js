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
exports.Utility = void 0;
const axios_1 = __importDefault(require("axios"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
class Utility {
    /**
     * Hash a password
     * @param password - Plain text password
     * @returns Hashed password
     */
    static hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt_1.default.hash(password, Number(config_1.default.saltRounds));
        });
    }
    /**
     * Compare a plain text password with a hashed password
     * @param password - Plain text password
     * @param hash - Hashed password
     * @returns Boolean indicating whether the passwords match
     */
    static comparePassword(password, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt_1.default.compare(password, hash);
        });
    }
    /**
     * Generate a 6-digit OTP
     * @returns A string representing the OTP
     */
    static generateOtp() {
        return Array.from({ length: config_1.default.otpLength }, () => Math.floor(Math.random() * 10)).join('');
    }
    /**
     * Generate an access token
     * @param userId - User ID
     * @param role - User role (e.g., Admin, Seller)
     * @param mobileNo - User mobile number
     * @returns A JWT token as a string
     */
    static generateAccessToken(userId, role, mobileNo) {
        const payload = { userId, role, mobileNo };
        return jsonwebtoken_1.default.sign(payload, config_1.default.jwtSecret); // Token expires in 1 hour
    }
    static sendOtp(mobileNo, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const smsResponse = yield axios_1.default.get(`https://bulksmsbd.net/api/smsapi?api_key=hsYr6qwobYaKBZdh8xXJ&type=text&number=${mobileNo}&senderid=8809617623563&message=Otp:${otp}`);
                console.log(smsResponse.data);
                return smsResponse.data;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static sendSms(mobileNo, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const smsResponse = yield axios_1.default.get(`https://bulksmsbd.net/api/smsapi?api_key=hsYr6qwobYaKBZdh8xXJ&type=text&number=${mobileNo}&senderid=8809617623563&message=Password:${message}`);
                console.log(smsResponse.data);
                return smsResponse.data;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.Utility = Utility;
exports.default = Utility;
