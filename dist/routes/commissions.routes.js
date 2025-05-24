"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerCommissionRoutes = void 0;
const express_1 = require("express");
const commission_controller_1 = __importDefault(require("../controllers/commission.controller"));
const commissionRoutes = (0, express_1.Router)();
const sellerCommissionRoutes = (0, express_1.Router)();
exports.sellerCommissionRoutes = sellerCommissionRoutes;
// Commission Table Management
commissionRoutes.put('/', commission_controller_1.default.replaceCommissionTable);
commissionRoutes.get('/', commission_controller_1.default.getCommissionTable);
sellerCommissionRoutes.get('/', commission_controller_1.default.getCommissionTable);
// Commission Calculations
commissionRoutes.post('/calculations', commission_controller_1.default.calculateUserCommissions);
commissionRoutes.get('/calculations/:price', commission_controller_1.default.getCommissionsForPrice);
exports.default = commissionRoutes;
