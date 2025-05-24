"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const announcements_controller_1 = __importDefault(require("../controllers/announcements.controller"));
const announcementRoutes = (0, express_1.Router)();
announcementRoutes.get('/', announcements_controller_1.default.getAnnouncements);
announcementRoutes.put('/', announcements_controller_1.default.updateAnnouncements);
exports.default = announcementRoutes;
