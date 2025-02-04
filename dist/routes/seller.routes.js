"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const sellerProducts_route_1 = __importDefault(require("./sellerProducts.route"));
const sellerWithdraw_routes_1 = __importDefault(require("./sellerWithdraw.routes"));
const wallet_routes_1 = __importDefault(require("./wallet.routes"));
const sellerRouter = (0, express_1.Router)();
sellerRouter.use(auth_middlewares_1.isAuthenticated, auth_middlewares_1.verifySeller);
sellerRouter.use('/products', sellerProducts_route_1.default);
sellerRouter.use('/wallets', wallet_routes_1.default);
sellerRouter.use('/withdraw', sellerWithdraw_routes_1.default);
exports.default = sellerRouter;
