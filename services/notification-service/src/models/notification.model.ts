import {
  type HydratedDocument,
  type Model,
  Schema,
  model,
} from "mongoose";

export const NOTIFICATION_TYPES = [
  "ORDER_CREATED",
  "ORDER_ASSIGNED",
  "ORDER_DISPATCHED",
  "ORDER_DELIVERED",
  "SYSTEM_ALERT",
] as const;

export const DELIVERY_CHANNELS = ["EMAIL", "SMS", "PUSH"] as const;

export const NOTIFICATION_STATUSES = ["PENDING", "SENT", "FAILED"] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export type DeliveryChannel = (typeof DELIVERY_CHANNELS)[number];
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export interface INotification {
  notificationId: string;
  userId: string;
  relatedOrderId?: string;
  title: string;
  message: string;
  type: NotificationType;
  deliveryChannel: DeliveryChannel;
  status: NotificationStatus;
  isRead: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = HydratedDocument<INotification>;

type NotificationModel = Model<INotification>;

const generateNotificationIdCandidate = (): string => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `NTF-${year}${month}${day}-${timestamp}${random}`;
};

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    notificationId: {
      type: String,
      unique: true,
      immutable: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    relatedOrderId: {
      type: String,
      required: false,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: NOTIFICATION_TYPES,
    },
    deliveryChannel: {
      type: String,
      required: true,
      enum: DELIVERY_CHANNELS,
    },
    status: {
      type: String,
      required: true,
      enum: NOTIFICATION_STATUSES,
      default: "PENDING",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

notificationSchema.pre("save", async function () {
  const notificationDoc = this as NotificationDocument;

  if (notificationDoc.notificationId) {
    return;
  }

  const notificationModel = notificationDoc.constructor as NotificationModel;
  let generatedNotificationId = generateNotificationIdCandidate();

  while (await notificationModel.exists({ notificationId: generatedNotificationId })) {
    generatedNotificationId = generateNotificationIdCandidate();
  }

  notificationDoc.notificationId = generatedNotificationId;
});

notificationSchema.index({ userId: 1, status: 1, type: 1 });

export const Notification = model<INotification, NotificationModel>(
  "Notification",
  notificationSchema,
);
