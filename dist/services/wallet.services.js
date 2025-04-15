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
const user_services_1 = __importDefault(require("./user.services"));
const walletContact_services_1 = __importDefault(require("./walletContact.services"));
class WalletService {
    // create a add wallet method to add a new wallet
    addWallet(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, walletName, walletPhoneNo, }) {
            const user = yield user_services_1.default.getUserByUserId(String(userId));
            if (!user) {
                throw new ApiError_1.default(404, 'User not found');
            }
            // find if is there any wallet with the same phone number
            const wallet = yield prisma_1.default.wallet.findUnique({
                where: { walletName_walletPhoneNo: { walletName, walletPhoneNo } },
            });
            if (wallet) {
                throw new ApiError_1.default(400, 'Wallet with this phone number already exists');
            }
            // user can't create more than 3 walets
            const wallets = yield prisma_1.default.wallet.findMany({
                where: { userId: user.userId },
            });
            if (wallets.length >= config_1.default.maximumWallets) {
                throw new ApiError_1.default(400, `User can not create more than ${config_1.default.maximumWallets} wallets`);
            }
            if (walletPhoneNo !== user.phoneNo) {
                yield walletContact_services_1.default.checkWalletContact(walletPhoneNo);
            }
            // create a new wallet
            const newWallet = yield prisma_1.default.wallet.create({
                data: {
                    walletName,
                    walletPhoneNo,
                    userId: user.userId,
                    userName: user.name,
                    userPhoneNo: user.phoneNo,
                },
            });
            return newWallet;
        });
    }
    addAdminWallet(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, walletName, walletPhoneNo, }) {
            const user = yield user_services_1.default.getUserByUserId(String(userId));
            if (!user) {
                throw new ApiError_1.default(404, 'User not found');
            }
            // find if is there any wallet with the same phone number
            const wallet = yield prisma_1.default.wallet.findUnique({
                where: { walletName_walletPhoneNo: { walletName, walletPhoneNo } },
            });
            if (wallet) {
                throw new ApiError_1.default(400, 'এই ফোন নম্বর সহ একটি ওয়ালেট ইতিমধ্যে বিদ্যমান');
            }
            // create a new wallet
            const newWallet = yield prisma_1.default.wallet.create({
                data: {
                    walletName,
                    walletPhoneNo,
                    userId: user.userId,
                    userName: user.name,
                    userPhoneNo: user.phoneNo,
                },
            });
            return newWallet;
        });
    }
    deleteAdminWallet(walletId) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield prisma_1.default.wallet.findUnique({
                where: { walletId },
            });
            if (!wallet) {
                throw new ApiError_1.default(404, 'ওয়ালেট পাওয়া যায়নি');
            }
            // delete the wallet
            const result = yield prisma_1.default.wallet.delete({
                where: { walletId },
            });
            return result;
        });
    }
    // create a method to find all wallets of a user
    getWallets(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_services_1.default.getUserByUserId(userId);
            if (!user) {
                throw new ApiError_1.default(404, 'User not found');
            }
            const wallets = yield prisma_1.default.wallet.findMany({
                where: { userId: user.userId },
            });
            return wallets;
        });
    }
    getAdminWalletsForUser() {
        return __awaiter(this, void 0, void 0, function* () {
            // find admin at first 
            const admin = yield user_services_1.default.getAdminForTheUsers();
            if (!admin) {
                throw new ApiError_1.default(404, 'There is an error.Please try later');
            }
            const wallets = yield prisma_1.default.wallet.findMany({
                where: { userId: admin.userId },
                select: {
                    walletId: true,
                    walletName: true,
                    walletPhoneNo: true,
                }
            });
            return wallets;
        });
    }
    getWalletById(walletId) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield prisma_1.default.wallet.findUnique({
                where: { walletId },
                select: {
                    walletId: true,
                    walletName: true,
                    walletPhoneNo: true
                }
            });
            if (!wallet) {
                throw new ApiError_1.default(404, 'Wallet not found');
            }
            return wallet;
        });
    }
}
exports.default = new WalletService();
