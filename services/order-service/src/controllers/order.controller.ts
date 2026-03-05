import { type NextFunction, type Request, type Response } from "express";
import {
  type CreateOrderPayload,
  type OrderFilters,
  type UpdateOrderPayload,
  orderService,
} from "../services/order.service";
import { sendSuccess } from "../utils/apiResponse";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = req.body as CreateOrderPayload;
    const order = await orderService.createOrder(payload);

    sendSuccess(res, 201, "Order created successfully", order);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const filters: OrderFilters = {
      status:
        typeof req.query.status === "string"
          ? (req.query.status as OrderFilters["status"])
          : undefined,
      customerId:
        typeof req.query.customerId === "string" ? req.query.customerId : undefined,
      assignedFranchiseId:
        typeof req.query.assignedFranchiseId === "string"
          ? req.query.assignedFranchiseId
          : undefined,
    };

    const orders = await orderService.getOrders(filters);

    sendSuccess(res, 200, "Orders fetched successfully", orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const order = await orderService.getOrderById(req.params.id);

    sendSuccess(res, 200, "Order fetched successfully", order);
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = req.body as UpdateOrderPayload;
    const updatedOrder = await orderService.updateOrder(req.params.id, payload);

    sendSuccess(res, 200, "Order updated successfully", updatedOrder);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { status } = req.body as { status?: string };
    const updatedOrder = await orderService.updateOrderStatus(
      req.params.id,
      status as NonNullable<OrderFilters["status"]>,
    );

    sendSuccess(res, 200, "Order status updated successfully", updatedOrder);
  } catch (error) {
    next(error);
  }
};

export const assignVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { vehicleId } = req.body as { vehicleId?: string };
    const updatedOrder = await orderService.assignVehicle(
      req.params.id,
      vehicleId as string,
    );

    sendSuccess(res, 200, "Vehicle assigned successfully", updatedOrder);
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await orderService.softDeleteOrder(req.params.id);

    sendSuccess(res, 200, "Order deleted successfully");
  } catch (error) {
    next(error);
  }
};
