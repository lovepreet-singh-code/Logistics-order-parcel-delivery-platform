import { Types } from "mongoose";
import {
  DELIVERY_CHANNELS,
  NOTIFICATION_STATUSES,
  NOTIFICATION_TYPES,
  Notification,
  type DeliveryChannel,
  type NotificationDocument,
  type NotificationStatus,
  type NotificationType,
} from "../models/notification.model";
import { AppError } from "../middlewares/error.middleware";

export interface CreateNotificationPayload {
  userId: string;
  relatedOrderId?: string;
  title: string;
  message: string;
  type: NotificationType;
  deliveryChannel: DeliveryChannel;
  status?: NotificationStatus;
  isRead?: boolean;
}

export interface NotificationFilters {
  userId?: string;
  status?: NotificationStatus;
  type?: NotificationType;
}

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const isValidStatus = (value: unknown): value is NotificationStatus => {
  return (
    typeof value === "string" &&
    NOTIFICATION_STATUSES.includes(value as NotificationStatus)
  );
};

const isValidType = (value: unknown): value is NotificationType => {
  return typeof value === "string" && NOTIFICATION_TYPES.includes(value as NotificationType);
};

const isValidDeliveryChannel = (value: unknown): value is DeliveryChannel => {
  return (
    typeof value === "string" &&
    DELIVERY_CHANNELS.includes(value as DeliveryChannel)
  );
};

const validateNotificationId = (id: string): void => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid notification id");
  }
};

const validateCreatePayload = (payload: CreateNotificationPayload): void => {
  if (!isNonEmptyString(payload.userId)) {
    throw new AppError(400, "userId is required");
  }

  if (payload.relatedOrderId !== undefined && !isNonEmptyString(payload.relatedOrderId)) {
    throw new AppError(400, "relatedOrderId cannot be empty");
  }

  if (!isNonEmptyString(payload.title)) {
    throw new AppError(400, "title is required");
  }

  if (!isNonEmptyString(payload.message)) {
    throw new AppError(400, "message is required");
  }

  if (!isValidType(payload.type)) {
    throw new AppError(
      400,
      "type must be ORDER_CREATED, ORDER_ASSIGNED, ORDER_DISPATCHED, ORDER_DELIVERED, or SYSTEM_ALERT",
    );
  }

  if (!isValidDeliveryChannel(payload.deliveryChannel)) {
    throw new AppError(400, "deliveryChannel must be EMAIL, SMS, or PUSH");
  }

  if (payload.status !== undefined && !isValidStatus(payload.status)) {
    throw new AppError(400, "status must be PENDING, SENT, or FAILED");
  }

  if (payload.isRead !== undefined && typeof payload.isRead !== "boolean") {
    throw new AppError(400, "isRead must be a boolean");
  }
};

const validateStatus = (status: unknown): NotificationStatus => {
  if (!isValidStatus(status)) {
    throw new AppError(400, "status must be PENDING, SENT, or FAILED");
  }

  return status;
};

const buildFilters = (filters: NotificationFilters): Record<string, unknown> => {
  const query: Record<string, unknown> = { isActive: true };

  if (filters.userId !== undefined) {
    if (!isNonEmptyString(filters.userId)) {
      throw new AppError(400, "userId cannot be empty");
    }

    query.userId = filters.userId.trim();
  }

  if (filters.status !== undefined) {
    query.status = validateStatus(filters.status);
  }

  if (filters.type !== undefined) {
    if (!isValidType(filters.type)) {
      throw new AppError(
        400,
        "type must be ORDER_CREATED, ORDER_ASSIGNED, ORDER_DISPATCHED, ORDER_DELIVERED, or SYSTEM_ALERT",
      );
    }

    query.type = filters.type;
  }

  return query;
};

export const notificationService = {
  createNotification: async (
    payload: CreateNotificationPayload,
  ): Promise<NotificationDocument> => {
    validateCreatePayload(payload);

    const notification = await Notification.create({
      userId: payload.userId.trim(),
      relatedOrderId: payload.relatedOrderId?.trim(),
      title: payload.title.trim(),
      message: payload.message.trim(),
      type: payload.type,
      deliveryChannel: payload.deliveryChannel,
      status: payload.status ?? "PENDING",
      isRead: payload.isRead ?? false,
      isActive: true,
    });

    return notification;
  },

  getNotifications: async (
    filters: NotificationFilters,
  ): Promise<NotificationDocument[]> => {
    const query = buildFilters(filters);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .exec();

    return notifications;
  },

  getNotificationById: async (id: string): Promise<NotificationDocument> => {
    validateNotificationId(id);

    const notification = await Notification.findOne({ _id: id, isActive: true }).exec();

    if (!notification) {
      throw new AppError(404, "Notification not found");
    }

    return notification;
  },

  updateNotificationStatus: async (
    id: string,
    status: NotificationStatus,
  ): Promise<NotificationDocument> => {
    validateNotificationId(id);
    const validStatus = validateStatus(status);

    const updatedNotification = await Notification.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { status: validStatus } },
      { new: true, runValidators: true },
    ).exec();

    if (!updatedNotification) {
      throw new AppError(404, "Notification not found");
    }

    return updatedNotification;
  },

  markNotificationAsRead: async (id: string): Promise<NotificationDocument> => {
    validateNotificationId(id);

    const updatedNotification = await Notification.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { isRead: true } },
      { new: true, runValidators: true },
    ).exec();

    if (!updatedNotification) {
      throw new AppError(404, "Notification not found");
    }

    return updatedNotification;
  },

  softDeleteNotification: async (id: string): Promise<void> => {
    validateNotificationId(id);

    const updatedNotification = await Notification.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { isActive: false } },
      { new: true },
    ).exec();

    if (!updatedNotification) {
      throw new AppError(404, "Notification not found");
    }
  },
};
