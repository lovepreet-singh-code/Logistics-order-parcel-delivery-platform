import { Router } from "express";
import {
  assignDeliveryController,
  completeDeliveryController,
  failDeliveryController,
  returnDeliveryController,
  startDeliveryController,
} from "../controllers/delivery.controller";
import {
  validateAssignDelivery,
  validateFailDelivery,
  validateOrderOnly,
} from "../middlewares/deliveryValidation.middleware";

const deliveryRouter = Router();

deliveryRouter.post("/assign", validateAssignDelivery, (req, res, next) => {
  assignDeliveryController(req, res).catch(next);
});

deliveryRouter.post("/start", validateOrderOnly, (req, res, next) => {
  startDeliveryController(req, res).catch(next);
});

deliveryRouter.post("/complete", validateOrderOnly, (req, res, next) => {
  completeDeliveryController(req, res).catch(next);
});

deliveryRouter.post("/fail", validateFailDelivery, (req, res, next) => {
  failDeliveryController(req, res).catch(next);
});

deliveryRouter.post("/return", validateOrderOnly, (req, res, next) => {
  returnDeliveryController(req, res).catch(next);
});

export default deliveryRouter;
