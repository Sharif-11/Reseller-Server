"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tracking_controllers_1 = __importDefault(require("../controllers/tracking.controllers"));
const trackingRoutes = (0, express_1.Router)();
trackingRoutes.get('/', tracking_controllers_1.default.getTrackingInfo);
exports.default = trackingRoutes;
