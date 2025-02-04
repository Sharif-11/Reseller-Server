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
class ContactServices {
    /**
     * Create a new contact with phone number and OTP
     * @param phoneNo - The phone number of the contact
     * @param otp - The OTP for verification
     * @returns The created contact
     */
    createContact(phoneNo, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const contact = yield prisma.contact.create({
                data: {
                    phoneNo,
                    otp,
                    isVerified: false,
                    otpCreatedAt: new Date(),
                    totalOTP: 1, // Set totalOTP to 1 when creating a new contact
                },
            });
            return contact;
        });
    }
    /**
     * Update a contact's OTP by phone number
     * @param phoneNo - The phone number of the contact
     * @param otp - The new OTP for verification
     * @returns The updated contact
     */
    updateContact(phoneNo, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const contact = yield prisma.contact.update({
                where: { phoneNo },
                data: {
                    otp,
                    otpCreatedAt: new Date(),
                    totalOTP: {
                        increment: 1, // Increment totalOTP by 1 when updating the contact
                    },
                },
            });
            return contact;
        });
    }
    /**
     * Get a contact by phone number
     * @param phoneNo - The phone number of the contact
     * @returns The contact or null if not found
     */
    getContactByPhoneNo(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const contact = yield prisma.contact.findUnique({
                where: { phoneNo },
            });
            return contact;
        });
    }
    /**
     * Block a contact by phone number
     * @param phoneNo - The phone number of the contact
     * @returns The updated contact
     */
    blockContact(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const contact = yield prisma.contact.update({
                where: { phoneNo },
                data: {
                    isBlocked: true,
                },
            });
            return contact;
        });
    }
    /**
     * Unblock a contact by phone number and reset totalOTP to 0
     * @param phoneNo - The phone number of the contact
     * @returns The updated contact
     */
    unblockContact(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const contact = yield prisma.contact.update({
                where: { phoneNo },
                data: {
                    isBlocked: false,
                    totalOTP: 0, // Reset totalOTP to 0 when unblocking
                },
            });
            return contact;
        });
    }
    /**
     * Verify a contact by phone number and OTP
     * @param phoneNo - The phone number of the contact
     * @param otp - The OTP to verify
     * @returns The updated contact or null if verification fails
     */
    verifyContact(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            // Mark contact as verified
            const contact = yield prisma.contact.update({
                where: { phoneNo },
                data: {
                    isVerified: true,
                },
            });
            return contact;
        });
    }
    checkContact(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const contact = yield prisma.contact.findUnique({
                where: { phoneNo },
            });
            // check if contact is exist
            if (!contact) {
                throw new ApiError_1.default(404, 'Contact not found');
            }
            // check if contact is blocked
            if (contact.isBlocked) {
                throw new ApiError_1.default(400, 'Contact is blocked');
            }
            // check if contact is verified
            if (contact.isVerified) {
                return { isVerified: true };
            }
            else {
                throw new ApiError_1.default(400, 'Contact is not verified');
            }
            return contact;
        });
    }
}
exports.default = new ContactServices();
