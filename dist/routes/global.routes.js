"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_routes_1 = __importDefault(require("./admin.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const seller_routes_1 = __importDefault(require("./seller.routes"));
const users_route_1 = __importDefault(require("./users.route"));
const globalRoutes = (0, express_1.Router)();
// const moduleRoutes = [
//   {
//     path: 'auth',
//     route: authRouter,
//   },
// ]
// moduleRoutes.forEach(route => globalRoutes.use(route.path, route.route))
globalRoutes.use('/', users_route_1.default);
globalRoutes.use('/auth', auth_routes_1.default);
globalRoutes.use('/admin', admin_routes_1.default);
globalRoutes.use('/sellers', seller_routes_1.default);
exports.default = globalRoutes;
