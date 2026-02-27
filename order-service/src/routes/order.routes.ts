import { Router } from "express";
import {
  assignVehicle,
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  updateOrder,
  updateOrderStatus,
} from "../controllers/order.controller";

const orderRouter = Router();

orderRouter.post("/", createOrder);
orderRouter.get("/", getOrders);
orderRouter.get("/:id", getOrderById);
orderRouter.put("/:id", updateOrder);
orderRouter.patch("/:id/status", updateOrderStatus);
orderRouter.patch("/:id/assign-vehicle", assignVehicle);
orderRouter.delete("/:id", deleteOrder);

export default orderRouter;
