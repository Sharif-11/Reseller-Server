"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usersProducts_routes_1 = __importDefault(require("./usersProducts.routes"));
const usersRouter = (0, express_1.Router)();
usersRouter.use('/products', usersProducts_routes_1.default);
exports.default = usersRouter;
