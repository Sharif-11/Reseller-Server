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
const tracking_services_1 = __importDefault(require("../services/tracking.services"));
class TrackingController {
    getTrackingInfo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { url } = req.body;
                const trackingInfo = yield tracking_services_1.default.fetchTrackingInfo(url);
                res.status(200).json({
                    statusCode: 200,
                    message: 'Tracking info fetched successfully',
                    success: true,
                    data: trackingInfo,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new TrackingController();
