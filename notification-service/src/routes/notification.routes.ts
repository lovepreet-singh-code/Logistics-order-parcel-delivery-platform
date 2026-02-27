import { Router } from "express";
import {
  createNotification,
  deleteNotification,
  getNotificationById,
  getNotifications,
  markNotificationAsRead,
  updateNotificationStatus,
} from "../controllers/notification.controller";

const notificationRouter = Router();

notificationRouter.post("/", createNotification);
notificationRouter.get("/", getNotifications);
notificationRouter.get("/:id", getNotificationById);
notificationRouter.patch("/:id/status", updateNotificationStatus);
notificationRouter.patch("/:id/read", markNotificationAsRead);
notificationRouter.delete("/:id", deleteNotification);

export default notificationRouter;
