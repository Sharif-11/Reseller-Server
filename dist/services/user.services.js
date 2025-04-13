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
class UserServices {
    /**
     * Helper method to check if a referral code is unique
     * @param referralCode - The referral code to check
     * @throws ApiError if the referral code is already in use
     */
    checkReferralCodeUnique(referralCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingReferralCode = yield prisma_1.default.user.findUnique({
                where: { referralCode },
            });
            if (existingReferralCode) {
                throw new ApiError_1.default(400, 'এই রেফারেল কোডটি ইতিমধ্যেই ব্যবহৃত হয়েছে');
            }
        });
    }
    /**
     * Get a user by phone number
     * @param phoneNo - The phone number of the user
     * @returns The user object or throws an error if not found
     */
    getUserByPhoneNo(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.default.user.findUnique({
                where: { phoneNo },
                include: {
                    wallets: true
                }
            });
            if (!user) {
                throw new ApiError_1.default(404, 'ব্যবহারকারী পাওয়া যায়নি');
            }
            return user;
        });
    }
    /**
     * Get a user by userId
     * @param userId - The user ID of the user
     * @returns The user object or throws an error if not found
     */
    getUserByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.default.user.findUnique({
                where: { userId },
                include: {
                    wallets: true,
                },
            });
            if (!user) {
                throw new ApiError_1.default(404, 'ব্যবহারকারী পাওয়া যায়নি');
            }
            return user;
        });
    }
    /**
     * Get a user by email
     * @param email - The email of the user
     * @returns The user object or throws an error if not found
     */
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.default.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new ApiError_1.default(404, 'ইমেল দ্বারা ব্যবহারকারী পাওয়া যায়নি');
            }
            return user;
        });
    }
    /**
     * Verify a user
     * @param userId - The user ID of the user to be verified
     * @returns The updated user object
     */
    verifyUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.default.user.findUnique({
                where: { userId },
            });
            if (!user) {
                throw new ApiError_1.default(404, 'ব্যবহারকারী পাওয়া যায়নি');
            }
            if (user.isVerified) {
                throw new ApiError_1.default(400, 'এই ব্যবহারকারী ইতিমধ্যেই যাচাই করা হয়েছে');
            }
            const updatedUser = yield prisma_1.default.user.update({
                where: { userId },
                data: { isVerified: true },
            });
            return updatedUser;
        });
    }
    /**
     * Add balance to the user's account
     * @param userId - The user ID of the user
     * @param amount - The amount to add to the balance
     * @returns The updated user object with the new balance
     */
    /**
     * Add or update the referral code for the user
     * @param userId - The user ID of the user
     * @param referralCode - The referral code to be added or updated
     * @returns The updated user object
     */
    addReferralCode(userId, referralCode) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if the referral code is unique
            const user = yield prisma_1.default.user.findUnique({
                where: { userId },
            });
            if (!user) {
                throw new ApiError_1.default(404, 'ব্যবহারকারী পাওয়া যায়নি');
            }
            if (!user.isVerified) {
                throw new ApiError_1.default(400, 'You are not a verified seller yet. Please confirm minimum 1 order to get verified.');
            }
            if (user.referralCode) {
                throw new ApiError_1.default(400, 'You have already added a referral code.');
            }
            yield this.checkReferralCodeUnique(referralCode);
            const updatedUser = yield prisma_1.default.user.update({
                where: { userId },
                data: {
                    referralCode,
                },
            });
            return updatedUser;
        });
    }
    /**
     * Create a new user
     * @param phoneNo - The phone number of the user
     * @param name - The name of the user
     * @param zilla - The district of the user
     * @param upazilla - The sub-district of the user
     * @param address - The address of the user
     * @param password - The password for the user
     * @param email - The optional email of the user
     * @param shopName - The optional shop name for the user
     * @param nomineePhone - The optional nominee phone number
     * @param role - The role of the user (Admin or Seller)
     * @returns The created user object
     */
    createUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ phoneNo, name, zilla, upazilla, address, password, email, shopName, nomineePhone, role, }) {
            // Check if contact exists and is verified
            const contact = yield contact_services_1.default.getContactByPhoneNo(phoneNo);
            if (!contact) {
                throw new ApiError_1.default(404, 'যোগাযোগ নম্বর পাওয়া যায়নি');
            }
            if (!contact.isVerified) {
                throw new ApiError_1.default(400, 'যোগাযোগ নম্বরটি এখনও যাচাই করা হয়নি');
            }
            // Check if user with the phone number or email already exists
            const existingUser = yield prisma_1.default.user.findUnique({ where: { phoneNo } });
            if (existingUser) {
                throw new ApiError_1.default(400, 'এই ফোন নম্বরটি ইতিমধ্যেই একটি ব্যবহারকারীর সাথে যুক্ত');
            }
            if (email) {
                const existingEmailUser = yield prisma_1.default.user.findUnique({
                    where: { email },
                });
                if (existingEmailUser) {
                    throw new ApiError_1.default(400, 'এই ইমেলটি ইতিমধ্যেই একটি ব্যবহারকারীর সাথে যুক্ত');
                }
            }
            // Hash the password
            // Create the user
            const newUser = yield prisma_1.default.user.create({
                data: {
                    phoneNo,
                    name,
                    zilla,
                    upazilla,
                    address,
                    password,
                    email,
                    shopName,
                    nomineePhone,
                    role: role || 'Seller', // Default role is 'Seller'
                    isVerified: false, // Default to false for safety
                },
            });
            return newUser;
        });
    }
    /**
     * Update the user's profile information
     * @param userId - The user ID of the user
     * @param updates - The fields to be updated (name, zilla, upazilla, address, email, shopName, nomineePhone)
     * @returns The updated user object
     */
    updateProfile(userId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log({ userId, updates })
            const user = yield prisma_1.default.user.findUnique({
                where: { userId },
            });
            if (!user) {
                throw new ApiError_1.default(404, 'ব্যবহারকারী পাওয়া যায়নি');
            }
            const updatedUser = yield prisma_1.default.user.update({
                where: { userId },
                data: updates,
            });
            return updatedUser;
        });
    }
    /**
     * Update the user's password
     * @param userId - The user ID of the user
     * @param currentPassword - The current password of the user
     * @param newPassword - The new password to be set
     * @returns The updated user object
     */
    updatePassword(userId, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.default.user.findUnique({
                where: { userId },
            });
            if (!user) {
                throw new ApiError_1.default(404, 'ব্যবহারকারী পাওয়া যায়নি');
            }
            const updatedUser = yield prisma_1.default.user.update({
                where: { userId },
                data: {
                    password: newPassword,
                },
            });
            return updatedUser;
        });
    }
    forgotPassword(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            // Generate a random password
            const newPassword = utility_services_1.default.generateOtp(); // 6-digit OTP as a temporary password
            // Hash the new password
            const hashedPassword = yield utility_services_1.default.hashPassword(newPassword);
            const user = yield prisma_1.default.user.findUnique({ where: { phoneNo } });
            if (!user)
                throw new ApiError_1.default(404, 'এই ফোন নম্বর দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি');
            if (user.isLocked && user.role !== 'Admin') {
                throw new ApiError_1.default(400, 'আপনার অ্যাকাউন্ট লক করা হয়েছে। আনলক করতে আপনার অ্যাকাউন্ট রিচার্জ করুন।');
            }
            if (user.role !== 'Admin') {
                if (user.forgotPasswordSmsCount < config_1.default.maxForgotPasswordAttempts) {
                    // Free SMS
                    yield prisma_1.default.user.update({
                        where: { phoneNo },
                        data: {
                            forgotPasswordSmsCount: { increment: 1 },
                            password: hashedPassword,
                        },
                    });
                    yield sms_services_1.default.sendPassword(user.phoneNo, newPassword);
                }
                else {
                    // Paid SMS
                    const newBalance = +user.balance - config_1.default.smsCharge;
                    yield prisma_1.default.user.update({
                        where: { phoneNo },
                        data: {
                            balance: newBalance,
                            password: hashedPassword,
                        },
                    });
                    yield sms_services_1.default.sendPassword(user.phoneNo, newPassword);
                    yield prisma_1.default.user.update({
                        where: { phoneNo },
                        data: {
                            forgotPasswordSmsCount: { increment: 1 },
                            isLocked: newBalance < 0,
                        },
                    });
                }
            }
            else {
                yield prisma_1.default.user.update({
                    where: { phoneNo },
                    data: {
                        password: hashedPassword,
                    },
                });
                yield sms_services_1.default.sendPassword(user.phoneNo, newPassword);
            }
            return { sendPassword: true };
        });
    }
    /**
     * Get all users with filters (phoneNo, name), pagination is optional
     * @param filters - The filters for searching users (phoneNo, name)
     * @param page - The page number for pagination (optional)
     * @param pageSize - The number of users per page (optional)
     * @returns The list of users that match the filters
     */
    getAllUsers() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page, pageSize) {
            const query = {
                where: {
                    phoneNo: filters.phoneNo ? { contains: filters.phoneNo } : undefined,
                    name: filters.name ? { contains: filters.name } : undefined,
                },
                select: {
                    userId: true,
                    phoneNo: true,
                    name: true,
                    zilla: true,
                    upazilla: true,
                    address: true,
                    email: true,
                    shopName: true,
                    nomineePhone: true,
                    role: true,
                    isVerified: true,
                    balance: true,
                    referralCode: true,
                    createdAt: true,
                    updatedAt: true,
                    // Omit password
                },
            };
            if (page && pageSize) {
                query['skip'] = (page - 1) * pageSize;
                query['take'] = pageSize;
            }
            const users = yield prisma_1.default.user.findMany(query);
            return users;
        });
    }
    // unlock user
    unlockUser(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.default.user.findUnique({ where: { phoneNo } });
            if (!user)
                throw new ApiError_1.default(404, 'এই ফোন নম্বর দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি');
            yield prisma_1.default.user.update({
                where: { phoneNo },
                data: { isLocked: false, forgotPasswordSmsCount: 0 },
            });
            return { unLocked: true };
        });
    }
    getAdminForTheUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const admins = yield prisma_1.default.user.findFirst({
                where: {
                    role: 'Admin',
                },
                select: {
                    userId: true,
                },
            });
            return admins;
        });
    }
}
exports.default = new UserServices();
