import { DailyOrderStats } from "../models/dailyOrderStats.model";
import { FranchiseStats } from "../models/franchiseStats.model";
import { VehicleUtilization } from "../models/vehicleUtilization.model";

type OrderStatus = "DELIVERED" | "CANCELLED" | string;

type EventData = {
  assignedFranchiseId?: string;
  assignedVehicleId?: string;
  status?: OrderStatus;
};

export interface OrderEvent {
  eventId?: string;
  eventType?: string;
  eventVersion?: number;
  occurredAt?: string;
  producer?: string;
  correlationId?: string;
  data?: EventData;
}

const getDateKey = (occurredAt: string): string => {
  const date = new Date(occurredAt);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid occurredAt");
  }

  return date.toISOString().slice(0, 10);
};

const incrementDaily = async (
  date: string,
  fields: Partial<Record<"totalOrders" | "delivered" | "cancelled", number>>,
): Promise<void> => {
  const update: Record<string, number | Date> = {
    updatedAt: new Date(),
  };

  if (fields.totalOrders) {
    update.$inc_totalOrders = fields.totalOrders;
  }

  if (fields.delivered) {
    update.$inc_delivered = fields.delivered;
  }

  if (fields.cancelled) {
    update.$inc_cancelled = fields.cancelled;
  }

  const inc: Record<string, number> = {};

  if (update.$inc_totalOrders) {
    inc.totalOrders = update.$inc_totalOrders as number;
  }

  if (update.$inc_delivered) {
    inc.delivered = update.$inc_delivered as number;
  }

  if (update.$inc_cancelled) {
    inc.cancelled = update.$inc_cancelled as number;
  }

  await DailyOrderStats.updateOne(
    { date },
    {
      $setOnInsert: { date, totalOrders: 0, delivered: 0, cancelled: 0 },
      $inc: inc,
      $set: { updatedAt: new Date() },
    },
    { upsert: true },
  ).exec();
};

const incrementFranchise = async (
  franchiseId: string,
  fields: Partial<Record<"totalOrders" | "delivered" | "cancelled", number>>,
): Promise<void> => {
  const inc: Record<string, number> = {};

  if (fields.totalOrders) {
    inc.totalOrders = fields.totalOrders;
  }

  if (fields.delivered) {
    inc.delivered = fields.delivered;
  }

  if (fields.cancelled) {
    inc.cancelled = fields.cancelled;
  }

  await FranchiseStats.updateOne(
    { franchiseId },
    {
      $setOnInsert: {
        franchiseId,
        totalOrders: 0,
        delivered: 0,
        cancelled: 0,
      },
      $inc: inc,
      $set: { updatedAt: new Date() },
    },
    { upsert: true },
  ).exec();
};

const incrementVehicle = async (
  vehicleId: string,
  fields: Partial<
    Record<"assignedOrders" | "deliveredOrders" | "cancelledOrders", number>
  >,
): Promise<void> => {
  const inc: Record<string, number> = {};

  if (fields.assignedOrders) {
    inc.assignedOrders = fields.assignedOrders;
  }

  if (fields.deliveredOrders) {
    inc.deliveredOrders = fields.deliveredOrders;
  }

  if (fields.cancelledOrders) {
    inc.cancelledOrders = fields.cancelledOrders;
  }

  await VehicleUtilization.updateOne(
    { vehicleId },
    {
      $setOnInsert: {
        vehicleId,
        assignedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
      },
      $inc: inc,
      $set: { updatedAt: new Date() },
    },
    { upsert: true },
  ).exec();
};

const applyOrderCreated = async (event: OrderEvent): Promise<void> => {
  if (!event.occurredAt) {
    throw new Error("Missing occurredAt");
  }

  const dateKey = getDateKey(event.occurredAt);

  await incrementDaily(dateKey, { totalOrders: 1 });

  const franchiseId = event.data?.assignedFranchiseId;

  if (typeof franchiseId === "string" && franchiseId.trim() !== "") {
    await incrementFranchise(franchiseId.trim(), { totalOrders: 1 });
  }

  const vehicleId = event.data?.assignedVehicleId;

  if (typeof vehicleId === "string" && vehicleId.trim() !== "") {
    await incrementVehicle(vehicleId.trim(), { assignedOrders: 1 });
  }
};

const applyOrderStatusChanged = async (event: OrderEvent): Promise<void> => {
  if (!event.occurredAt) {
    throw new Error("Missing occurredAt");
  }

  const status = event.data?.status;

  if (status !== "DELIVERED" && status !== "CANCELLED") {
    return;
  }

  const dateKey = getDateKey(event.occurredAt);

  if (status === "DELIVERED") {
    await incrementDaily(dateKey, { delivered: 1 });
  } else {
    await incrementDaily(dateKey, { cancelled: 1 });
  }

  const franchiseId = event.data?.assignedFranchiseId;

  if (typeof franchiseId === "string" && franchiseId.trim() !== "") {
    if (status === "DELIVERED") {
      await incrementFranchise(franchiseId.trim(), { delivered: 1 });
    } else {
      await incrementFranchise(franchiseId.trim(), { cancelled: 1 });
    }
  }

  const vehicleId = event.data?.assignedVehicleId;

  if (typeof vehicleId === "string" && vehicleId.trim() !== "") {
    if (status === "DELIVERED") {
      await incrementVehicle(vehicleId.trim(), { deliveredOrders: 1 });
    } else {
      await incrementVehicle(vehicleId.trim(), { cancelledOrders: 1 });
    }
  }
};

export const applyAggregations = async (event: OrderEvent): Promise<void> => {
  switch (event.eventType) {
    case "OrderCreated":
      await applyOrderCreated(event);
      break;
    case "OrderStatusChanged":
      await applyOrderStatusChanged(event);
      break;
    default:
      break;
  }
};

export const getDailyReport = async (): Promise<
  Array<{
    date: string;
    totalOrders: number;
    delivered: number;
    cancelled: number;
    updatedAt: Date;
  }>
> => {
  return DailyOrderStats.find({}).sort({ date: -1 }).lean().exec();
};

export const getFranchiseReport = async (
  franchiseId: string,
): Promise<{
  franchiseId: string;
  totalOrders: number;
  delivered: number;
  cancelled: number;
  updatedAt: Date;
} | null> => {
  return FranchiseStats.findOne({ franchiseId }).lean().exec();
};

export const getVehicleReport = async (
  vehicleId: string,
): Promise<{
  vehicleId: string;
  assignedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  updatedAt: Date;
} | null> => {
  return VehicleUtilization.findOne({ vehicleId }).lean().exec();
};
