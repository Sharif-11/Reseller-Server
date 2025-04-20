import { NextFunction, Request, Response } from "express";
import CourierTracker from "../services/tracking.services";

class TrackingController{

    async getTrackingInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const { url } = req.query;
         
            const trackingInfo = await CourierTracker.fetchTrackingInfo(url as string);
            res.status(200).json({
                statusCode: 200,
                message: 'Tracking info fetched successfully',
                success: true,
                data: trackingInfo,
            });
        } catch (error) {
            next(error);
        }
    }
}
export default new TrackingController();