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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const utility_services_1 = __importDefault(require("./utility.services"));
class AuthService {
    sendOtp(mobileNo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma_1.default.user.findUnique({
                    where: {
                        mobileNo,
                    },
                });
                if (user) {
                    throw new ApiError_1.default(400, 'User already exists');
                }
                const otp = utility_services_1.default.generateOtp();
                const otpCreatedAt = new Date();
                //check if mobile number already exists in contacts
                const contact = yield prisma_1.default.contact.findUnique({
                    where: {
                        mobileNo,
                    },
                });
                if (contact) {
                    if (contact.isVerified) {
                        return 'Mobile number already verified';
                    }
                    yield prisma_1.default.contact.update({
                        where: {
                            mobileNo,
                        },
                        data: {
                            otp,
                            otp_created_at: otpCreatedAt,
                            isVerified: false,
                        },
                    });
                }
                else {
                    yield prisma_1.default.contact.create({
                        data: {
                            mobileNo,
                            otp,
                            otp_created_at: otpCreatedAt,
                            isVerified: false,
                        },
                    });
                }
                yield utility_services_1.default.sendOtp(mobileNo, otp);
                return 'OTP sent successfully';
            }
            catch (error) {
                console.error('Error sending OTP: ', error);
                throw error;
            }
        });
    }
    verifyOtp(mobileNo, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const contact = yield prisma_1.default.contact.findUnique({
                where: {
                    mobileNo,
                },
            });
            if (!contact) {
                throw new ApiError_1.default(400, 'Mobile number not found');
            }
            if (contact.isVerified) {
                return 'Mobile number already verified';
            }
            if (contact.otp !== otp) {
                throw new ApiError_1.default(400, 'Invalid OTP');
            }
            //check if OTP is expired
            const otpCreatedAt = contact.otp_created_at;
            const currentTime = new Date();
            const diff = currentTime.getTime() - otpCreatedAt.getTime();
            if (diff > config_1.default.otpExpiresIn) {
                throw new ApiError_1.default(400, 'OTP expired');
            }
            const result = yield prisma_1.default.contact.update({
                where: {
                    mobileNo,
                },
                data: {
                    isVerified: true,
                },
            });
            return 'OTP verified successfully';
        });
    }
    createAdmin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ mobileNo, password, name, zilla, address, email, }) {
            try {
                const user = yield prisma_1.default.user.findUnique({
                    where: {
                        mobileNo,
                    },
                });
                if (user) {
                    throw new ApiError_1.default(400, 'User already exists');
                }
                //check if mobile number is verified
                const contact = yield prisma_1.default.contact.findUnique({
                    where: {
                        mobileNo,
                    },
                });
                if (!contact || !contact.isVerified) {
                    throw new ApiError_1.default(400, 'Mobile number is not verified');
                }
                const hashedPassword = yield utility_services_1.default.hashPassword(password);
                const admin = yield prisma_1.default.user.create({
                    data: {
                        mobileNo,
                        password: hashedPassword,
                        role: 'Admin',
                        name,
                        zilla,
                        address,
                        email,
                    },
                });
                const { password: _ } = admin, adminWithoutPassword = __rest(admin, ["password"]);
                return adminWithoutPassword;
            }
            catch (error) {
                throw error;
            }
        });
    }
    createSeller(_a) {
        return __awaiter(this, arguments, void 0, function* ({ mobileNo, password, name, zilla, address, email, }) {
            try {
                const user = yield prisma_1.default.user.findUnique({
                    where: {
                        mobileNo,
                    },
                });
                if (user) {
                    throw new ApiError_1.default(400, 'User already exists');
                }
                //check if mobile number is verified
                const contact = yield prisma_1.default.contact.findUnique({
                    where: {
                        mobileNo,
                    },
                });
                if (!contact || !contact.isVerified) {
                    throw new ApiError_1.default(400, 'Mobile number is not verified');
                }
                const hashedPassword = yield utility_services_1.default.hashPassword(password);
                const seller = yield prisma_1.default.user.create({
                    data: {
                        mobileNo,
                        password: hashedPassword,
                        role: 'Seller',
                        name,
                        zilla,
                        address,
                        email,
                    },
                });
                const { password: _ } = seller, sellerWithoutPassword = __rest(seller, ["password"]);
                return sellerWithoutPassword;
            }
            catch (error) {
                throw error;
            }
        });
    }
    login(_a) {
        return __awaiter(this, arguments, void 0, function* ({ mobileNo, password }) {
            try {
                const user = yield prisma_1.default.user.findUnique({
                    where: {
                        mobileNo,
                    },
                });
                if (!user) {
                    throw new ApiError_1.default(400, 'User not found');
                }
                const isPasswordMatch = yield utility_services_1.default.comparePassword(password, user.password);
                if (!isPasswordMatch) {
                    throw new ApiError_1.default(400, 'Invalid password');
                }
                const accessToken = utility_services_1.default.generateAccessToken(user.userId, user.role, user.mobileNo);
                const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
                return { user: userWithoutPassword, accessToken };
            }
            catch (error) {
                console.error('Error logging in: ', error);
                throw error;
            }
        });
    }
    updateProfile(userId_1, _a) {
        return __awaiter(this, arguments, void 0, function* (userId, { name, address, email, zilla, shopName, }) {
            try {
                const user = yield prisma_1.default.user.findUnique({
                    where: {
                        userId,
                    },
                });
                if (!user) {
                    throw new ApiError_1.default(400, 'User not found');
                }
                const updatedUser = yield prisma_1.default.user.update({
                    where: {
                        userId,
                    },
                    data: {
                        name,
                        address,
                        email,
                        zilla,
                        shopName,
                    },
                });
                const { password: _ } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
                return userWithoutPassword;
            }
            catch (error) {
                throw error;
            }
        });
    }
    changePassword(userId_1, _a) {
        return __awaiter(this, arguments, void 0, function* (userId, { oldPassword, newPassword }) {
            try {
                const user = yield prisma_1.default.user.findUnique({
                    where: {
                        userId,
                    },
                });
                if (!user) {
                    throw new ApiError_1.default(400, 'User not found');
                }
                const isPasswordMatch = yield utility_services_1.default.comparePassword(oldPassword, user.password);
                if (!isPasswordMatch) {
                    throw new ApiError_1.default(400, 'Invalid password');
                }
                const hashedPassword = yield utility_services_1.default.hashPassword(newPassword);
                yield prisma_1.default.user.update({
                    where: {
                        userId,
                    },
                    data: {
                        password: hashedPassword,
                    },
                });
                return 'Password changed successfully';
            }
            catch (error) {
                throw error;
            }
        });
    }
    forgotPassword(mobileNo, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma_1.default.user.findUnique({
                    where: {
                        mobileNo,
                    },
                });
                if (!user) {
                    throw new ApiError_1.default(400, 'User not found');
                }
                const hashedPassword = yield utility_services_1.default.hashPassword(newPassword);
                yield prisma_1.default.user.update({
                    where: {
                        mobileNo,
                    },
                    data: {
                        password: hashedPassword,
                    },
                });
                return 'Password changed successfully';
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new AuthService();
