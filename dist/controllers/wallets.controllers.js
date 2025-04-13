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
const wallet_services_1 = __importDefault(require("../services/wallet.services"));
class WalletController {
    addAdminWallet(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { walletName, walletPhoneNo } = req.body;
                const newWallet = yield wallet_services_1.default.addAdminWallet({
                    userId: userId,
                    walletName,
                    walletPhoneNo,
                });
                res.status(201).json({
                    statusCode: 201,
                    message: 'ওয়ালেট সফলভাবে তৈরি করা হয়েছে',
                    success: true,
                    data: newWallet,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteAdminWallet(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const walletId = Number(req.params.walletId);
                const result = yield wallet_services_1.default.deleteAdminWallet(walletId);
                res.status(200).json({
                    statusCode: 200,
                    message: 'ওয়ালেট সফলভাবে মুছে ফেলা হয়েছে',
                    success: true,
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Add a new wallet for a user
     */
    addWallet(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                console.log({ userId });
                const { walletName, walletPhoneNo } = req.body;
                const newWallet = yield wallet_services_1.default.addWallet({
                    userId: userId,
                    walletName,
                    walletPhoneNo,
                });
                res.status(201).json({
                    statusCode: 201,
                    message: 'ওয়ালেট সফলভাবে তৈরি করা হয়েছে',
                    success: true,
                    data: newWallet,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Get all wallets of a specific user
     */
    getWallets(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const wallets = yield wallet_services_1.default.getWallets(userId);
                res.status(200).json({
                    statusCode: 200,
                    message: 'Wallets successfully retrieved',
                    success: true,
                    data: wallets,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAdminWalletsForUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallets = yield wallet_services_1.default.getAdminWalletsForUser();
                res.status(200).json({
                    statusCode: 200,
                    message: 'Wallets successfully retrieved',
                    success: true,
                    data: wallets,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new WalletController();
