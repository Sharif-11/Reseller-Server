import { Router } from "express";
import trackingControllers from "../controllers/tracking.controllers";

const trackingRoutes=Router()
trackingRoutes.get('/',trackingControllers.getTrackingInfo)
export default trackingRoutes