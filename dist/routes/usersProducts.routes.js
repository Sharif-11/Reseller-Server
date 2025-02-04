"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = __importDefault(require("../controllers/product.controller"));
const userProductsRouter = (0, express_1.Router)();
userProductsRouter.get('/', product_controller_1.default.getAllProducts);
userProductsRouter.get('/:productId', product_controller_1.default.getProduct);
exports.default = userProductsRouter;
