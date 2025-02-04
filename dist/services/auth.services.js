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
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const contact_services_1 = __importDefault(require("./contact.services"));
const otp_services_1 = __importDefault(require("./otp.services"));
const user_services_1 = __importDefault(require("./user.services"));
const utility_services_1 = __importDefault(require("./utility.services"));
class AuthServices {
    /**
     * Create a new Admin user
     * @param phoneNo - The phone number of the admin user
     * @param name - The name of the admin
     * @param password - The password for the admin user
     * @returns The created admin user
     */
    createAdmin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ phoneNo, name, password, email, shopName, zilla, upazilla, address, nomineePhone, }) {
            // Check if the user exists already
            const existingUser = yield prisma_1.default.user.findUnique({
                where: { phoneNo },
            });
            if (existingUser) {
                throw new ApiError_1.default(400, 'এই ফোন নম্বরটি ইতিমধ্যেই ব্যবহৃত হয়েছে');
            }
            // Create the Admin user
            const hashedPassword = yield utility_services_1.default.hashPassword(password);
            const newUser = yield prisma_1.default.user.create({
                data: {
                    phoneNo,
                    name,
                    email,
                    shopName,
                    nomineePhone,
                    role: 'Admin',
                    password: hashedPassword,
                    zilla,
                    upazilla,
                    address,
                    isVerified: true, // Admins are verified by default
                },
            });
            return newUser;
        });
    }
    /**
     * Create a new Seller user
     * @param phoneNo - The phone number of the seller user
     * @param name - The name of the seller
     * @param password - The password for the seller user
     * @param email - The optional email of the seller
     * @param shopName - The shop name of the seller
     * @param nomineePhone - The optional nominee phone number of the seller
     * @returns The created seller user
     */
    createSeller(_a) {
        return __awaiter(this, arguments, void 0, function* ({ phoneNo, name, password, email, shopName, zilla, upazilla, address, nomineePhone, referralCode, }) {
            try {
                // Check if phone number already exists
                const existingUser = yield prisma_1.default.user.findUnique({
                    where: { phoneNo },
                });
                if (existingUser) {
                    throw new ApiError_1.default(400, 'এই ফোন নম্বরটি ইতিমধ্যেই ব্যবহৃত হয়েছে');
                }
                // Check if contact exists and is verified
                const contact = yield contact_services_1.default.getContactByPhoneNo(phoneNo);
                if (!contact) {
                    throw new ApiError_1.default(400, 'এই ফোন নম্বরটি পাওয়া যায়নি');
                }
                if (!contact.isVerified) {
                    throw new ApiError_1.default(400, 'এই ফোন নম্বরটি যাচাই করা হয়নি');
                }
                // Check if email is already in use
                if (email) {
                    const existingUserWithEmail = yield prisma_1.default.user.findUnique({
                        where: { email },
                    });
                    if (existingUserWithEmail) {
                        throw new ApiError_1.default(400, 'এই ইমেইলটি ইতিমধ্যেই ব্যবহৃত হয়েছে');
                    }
                }
                let referredByPhone = null;
                // Handle referral code (if provided)
                if (referralCode) {
                    const referrer = yield prisma_1.default.user.findUnique({
                        where: { referralCode },
                        select: { phoneNo: true }, // Only fetch phone number
                    });
                    if (!referrer) {
                        throw new ApiError_1.default(400, 'এই রেফারেল কোডটি সঠিক নয়');
                    }
                    referredByPhone = referrer.phoneNo;
                }
                // Hash the password before storing
                const hashedPassword = yield utility_services_1.default.hashPassword(password);
                // Create the seller using an atomic transaction
                const newUser = yield prisma_1.default.user.create({
                    data: {
                        phoneNo,
                        name,
                        email,
                        shopName,
                        nomineePhone,
                        role: 'Seller',
                        password: hashedPassword,
                        zilla,
                        upazilla,
                        address,
                        isVerified: false,
                        referredByPhone, // Store referrer's phone number if exists
                    },
                    select: {
                        userId: true,
                        phoneNo: true,
                        name: true,
                        email: true,
                        shopName: true,
                        nomineePhone: true,
                        role: true,
                        zilla: true,
                        upazilla: true,
                        address: true,
                        isVerified: true,
                        referralCode: true,
                        isLocked: true,
                        createdAt: true,
                        updatedAt: true,
                        balance: true,
                    },
                });
                return newUser;
            }
            catch (error) {
                if (error instanceof ApiError_1.default) {
                    throw error;
                }
                else {
                    throw new ApiError_1.default(500, 'কিছু একটা সমস্যা হয়েছে। দয়া করে পরে আবার চেষ্টা করুন।');
                }
            }
        });
    }
    /**
     * Login using phone number and password
     * @param phoneNo - The phone number of the user
     * @param password - The password of the user
     * @returns The logged-in user and access token
     */
    loginWithPhoneNoAndPassword(phoneNo, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_services_1.default.getUserByPhoneNo(phoneNo);
            // Compare passwords
            const isPasswordValid = yield utility_services_1.default.comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw new ApiError_1.default(400, 'পাসওয়ার্ড সঠিক নয়');
            }
            // Generate access token
            const token = utility_services_1.default.generateAccessToken(user.userId, user.role, user.phoneNo);
            return { user, token };
        });
    }
    /**
     * Send OTP to the phone number for verification
     * @param phoneNo - The phone number to send the OTP to
     * @returns The OTP sending status
     */
    sendOtp(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            return otp_services_1.default.sendOtp(phoneNo);
        });
    }
    /**
     * Verify OTP for the phone number
     * @param phoneNo - The phone number to verify
     * @param otp - The OTP to verify
     * @returns OTP verification status
     */
    verifyOtp(phoneNo, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            return otp_services_1.default.verifyOtp(phoneNo, otp);
        });
    }
    /**
     * Update user profile information
     * @param userId - The user ID of the user
     * @param updates - The fields to be updated
     * @returns The updated user object
     */
    updateProfile(userId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_services_1.default.updateProfile(userId, updates);
        });
    }
    /**
     * Update user password
     * @param userId - The user ID of the user
     * @param currentPassword - The current password of the user
     * @param newPassword - The new password
     * @returns The updated user object
     */
    updatePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if the user exists
            console.log({ userId, currentPassword, newPassword });
            const user = yield user_services_1.default.getUserByUserId(userId);
            console.log({ user });
            // Compare current password
            const isPasswordValid = yield utility_services_1.default.comparePassword(currentPassword, user.password);
            console.log({ isPasswordValid });
            if (!isPasswordValid) {
                throw new ApiError_1.default(400, 'বর্তমান পাসওয়ার্ড সঠিক নয়');
            }
            // Hash new password
            const hashedPassword = yield utility_services_1.default.hashPassword(newPassword);
            // Update password
            return user_services_1.default.updatePassword(userId, hashedPassword);
        });
    }
    /**
     * Add referral code for the user
     * @param userId - The user ID of the user
     * @param referralCode - The referral code to be added
     * @returns The updated user with referral code
     */
    addReferralCode(userId, referralCode) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_services_1.default.addReferralCode(userId, referralCode);
        });
    }
    /**
     * Get a specific user by phone number
     * @param phoneNo - The phone number of the user
     * @returns The user object
     */
    getUserByPhoneNo(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_services_1.default.getUserByPhoneNo(phoneNo);
        });
    }
    /**
     * Get all users
     * @returns The list of all users
     */
    getAllUsers() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page, pageSize) {
            return user_services_1.default.getAllUsers(filters, page, pageSize);
        });
    }
    /**
     * Handle Forgot Password
     * @param phoneNo - The phone number of the user requesting the password reset
     * @returns A status message indicating the result
     */
    forgotPassword(phoneNo) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_services_1.default.forgotPassword(phoneNo);
        });
    }
}
exports.default = new AuthServices();
