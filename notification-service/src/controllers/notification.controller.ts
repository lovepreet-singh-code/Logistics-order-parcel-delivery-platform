import { type NextFunction, type Request, type Response } from "express";
import {
  type CreateNotificationPayload,
  type NotificationFilters,
  notificationService,
} from "../services/notification.service";
import { sendSuccess } from "../utils/apiResponse";

export const createNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = req.body as CreateNotificationPayload;
    const notification = await notificationService.createNotification(payload);

    sendSuccess(res, 201, "Notification created successfully", notification);
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const filters: NotificationFilters = {
      userId: typeof req.query.userId === "string" ? req.query.userId : undefined,
      status:
        typeof req.query.status === "string"
          ? (req.query.status as NotificationFilters["status"])
          : undefined,
      type:
        typeof req.query.type === "string"
          ? (req.query.type as NotificationFilters["type"])
          : undefined,
    };

    const notifications = await notificationService.getNotifications(filters);

    sendSuccess(res, 200, "Notifications fetched successfully", notifications);
  } catch (error) {
    next(error);
  }
};

export const getNotificationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const notification = await notificationService.getNotificationById(req.params.id);

    sendSuccess(res, 200, "Notification fetched successfully", notification);
  } catch (error) {
    next(error);
  }
};

export const updateNotificationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { status } = req.body as { status?: string };

    const updatedNotification = await notificationService.updateNotificationStatus(
      req.params.id,
      status as NonNullable<NotificationFilters["status"]>,
    );

    sendSuccess(
      res,
      200,
      "Notification status updated successfully",
      updatedNotification,
    );
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const updatedNotification = await notificationService.markNotificationAsRead(
      req.params.id,
    );

    sendSuccess(
      res,
      200,
      "Notification marked as read successfully",
      updatedNotification,
    );
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await notificationService.softDeleteNotification(req.params.id);

    sendSuccess(res, 200, "Notification deleted successfully");
  } catch (error) {
    next(error);
  }
};
