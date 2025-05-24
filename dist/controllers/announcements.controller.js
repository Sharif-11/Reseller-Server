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
const announcement_services_1 = __importDefault(require("../services/announcement.services"));
class AnnouncementController {
    /**
     * Get all current announcements
     */
    getAnnouncements(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const announcements = yield announcement_services_1.default.getCurrentAnnouncements();
                res.status(200).json({
                    statusCode: 200,
                    message: 'Announcements retrieved successfully',
                    success: true,
                    data: announcements,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Completely replace all announcements (PUT operation)
     */
    updateAnnouncements(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { announcements } = req.body; // Expecting array of strings
                console.clear();
                console.log('Received announcements:', announcements);
                const updated = yield announcement_services_1.default.replaceAllAnnouncements(announcements);
                res.status(200).json({
                    statusCode: 200,
                    message: 'Announcements updated successfully',
                    success: true,
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new AnnouncementController();
