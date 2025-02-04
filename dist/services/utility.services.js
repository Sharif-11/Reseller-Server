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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
class Utility {
    static hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt_1.default.hash(password, Number(config_1.default.saltRounds));
        });
    }
    static comparePassword(password, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt_1.default.compare(password, hash);
        });
    }
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
}
exports.Utility = Utility;
exports.default = Utility;
