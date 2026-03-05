import { Router } from "express";
import { getTrackingTimeline } from "../controllers/tracking.controller";

const trackingRouter = Router();

trackingRouter.get("/:orderId", getTrackingTimeline);

export default trackingRouter;
