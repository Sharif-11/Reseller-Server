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
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const prisma = new client_1.PrismaClient();
class WalletContactServices {
    /**
     * Create a new wallet contact with phone number and OTP
     * @param phoneNo - The phone number of the wallet contact
     * @param otp - The OTP for verification
     * @returns The created wallet contact
     */
    createWalletContact(phoneNo, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletContact = yield prisma.walletContact.create({
                data: {
                    phoneNo,
                    otp,
                    isVerified: false,
                    otpCreatedAt: new Date(),
                    totalOTP: 1, // Set totalOTP to 1 when creating a new wallet contact
                },
            });
            return walletContact;
        });
    }
    /**
     * Update a wallet contact's OTP by phone number
     * @param phoneNo - The phone number of the wallet contact
     * @param otp - The new OTP for verification
     * @returns The updated wallet contact
     */
    updateWalletContact(phoneNo, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletContact = yield prisma.walletContact.update({
                where: { phoneNo },
                data: {
                    otp,
                    otpCreatedAt: new Date(),
                    totalOTP: {
                        increment: 1, // Increment totalOTP by 1 when updating the wallet contact
                    },
                },
            });
            return walletContact;
        });
    }
    /**
     * Get a wallet contact by phone number
     * @param phoneNo - The phone number of the wallet contact
     * @returns The wallet contact or null if not found
     */
    getWalletContactByPhoneNo(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletContact = yield prisma.walletContact.findUnique({
                where: { phoneNo },
            });
            return walletContact;
        });
    }
    /**
     * Block a wallet contact by phone number
     * @param phoneNo - The phone number of the wallet contact
     * @returns The updated wallet contact
     */
    blockWalletContact(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletContact = yield prisma.walletContact.update({
                where: { phoneNo },
                data: {
                    isBlocked: true,
                },
            });
            return walletContact;
        });
    }
    /**
     * Unblock a wallet contact by phone number and reset totalOTP to 0
     * @param phoneNo - The phone number of the wallet contact
     * @returns The updated wallet contact
     */
    unblockWalletContact(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletContact = yield prisma.walletContact.update({
                where: { phoneNo },
                data: {
                    isBlocked: false,
                    totalOTP: 0, // Reset totalOTP to 0 when unblocking
                },
            });
            return walletContact;
        });
    }
    /**
     * Verify a wallet contact by phone number
     * @param phoneNo - The phone number of the wallet contact
     * @returns The updated wallet contact or null if verification fails
     */
    verifyWalletContact(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletContact = yield prisma.walletContact.update({
                where: { phoneNo },
                data: {
                    isVerified: true,
                },
            });
            return walletContact;
        });
    }
    /**
     * Check the status of a wallet contact by phone number
     * @param phoneNo - The phone number of the wallet contact
     * @returns The status of the wallet contact
     */
    checkWalletContact(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletContact = yield prisma.walletContact.findUnique({
                where: { phoneNo },
            });
            // Check if wallet contact exists
            if (!walletContact) {
                throw new ApiError_1.default(404, 'Wallet contact not found');
            }
            // Check if wallet contact is blocked
            if (walletContact.isBlocked) {
                throw new ApiError_1.default(400, 'Wallet contact is blocked');
            }
            // Check if wallet contact is verified
            if (walletContact.isVerified) {
                return { isVerified: true };
            }
            else {
                throw new ApiError_1.default(400, 'Wallet contact is not verified');
            }
        });
    }
}
exports.default = new WalletContactServices();
