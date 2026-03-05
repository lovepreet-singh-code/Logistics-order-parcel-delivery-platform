import { Router } from "express";
import {
  assignDeliveryController,
  completeDeliveryController,
  failDeliveryController,
  returnDeliveryController,
  startDeliveryController,
} from "../controllers/delivery.controller";

const deliveryRouter = Router();

deliveryRouter.post("/assign", (req, res, next) => {
  assignDeliveryController(req, res).catch(next);
});

deliveryRouter.post("/start", (req, res, next) => {
  startDeliveryController(req, res).catch(next);
});

deliveryRouter.post("/complete", (req, res, next) => {
  completeDeliveryController(req, res).catch(next);
});

deliveryRouter.post("/fail", (req, res, next) => {
  failDeliveryController(req, res).catch(next);
});

deliveryRouter.post("/return", (req, res, next) => {
  returnDeliveryController(req, res).catch(next);
});

export default deliveryRouter;
