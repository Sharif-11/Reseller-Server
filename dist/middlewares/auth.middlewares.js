"use strict";
//A middleware to ck if the user is authenticated
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const isAuthenticated = (req, res, next) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token) {
        return next(new ApiError_1.default(401, 'Unauthorized'));
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
        req.user = payload;
        next();
    }
    catch (error) {
        next(new ApiError_1.default(401, 'Unauthorized'));
    }
};
exports.isAuthenticated = isAuthenticated;
