import { Delivery } from "../models/delivery.model";
import { ProcessedEvent } from "../models/processedEvent.model";
import type { PlanConfirmedEvent } from "../events/planning.events";
import {
  DELIVERY_STATES,
  validateTransition,
} from "../state-machine/delivery.state-machine";
import { publishEvent } from "../kafka/producer";
import { DELIVERY_EVENTS } from "../events/delivery.events";
import { buildEventEnvelope } from "../utils/eventEnvelope";
import {
  removeActiveDelivery,
  setActiveDelivery,
  updateActiveDelivery,
} from "../cache/delivery.cache";
import { AppError } from "../utils/appError";

const DELIVERY_EVENTS_TOPIC = "logistics.delivery.events";

const parseDate = (value: string | undefined, fallback: string): Date => {
  const source = value ?? fallback;
  const date = new Date(source);

  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid plannedAt/occurredAt date", 400, "INVALID_DATE");
  }

  return date;
};

const validateEvent = (event: PlanConfirmedEvent): void => {
  if (!event.eventId?.trim()) {
    throw new AppError("Invalid eventId", 400, "INVALID_EVENT_ID");
  }

  if (!event.data?.orderId?.trim()) {
    throw new AppError("Invalid orderId", 400, "INVALID_ORDER_ID");
  }

  if (!event.data.franchiseId?.trim()) {
    throw new AppError("Invalid franchiseId", 400, "INVALID_FRANCHISE_ID");
  }

  if (!event.data.vehicleId?.trim()) {
    throw new AppError("Invalid vehicleId", 400, "INVALID_VEHICLE_ID");
  }

  if (!event.data.driverId?.trim()) {
    throw new AppError("Invalid driverId", 400, "INVALID_DRIVER_ID");
  }

  if (!event.occurredAt?.trim()) {
    throw new AppError("Invalid occurredAt", 400, "INVALID_OCCURRED_AT");
  }
};

const getDeliveryByOrderId = async (orderId: string) => {
  const delivery = await Delivery.findOne({ orderId }).exec();

  if (!delivery) {
    throw new AppError(
      `Delivery not found for orderId: ${orderId}`,
      404,
      "DELIVERY_NOT_FOUND",
    );
  }

  return delivery;
};

const emitDeliveryEvent = async (
  orderId: string,
  eventType: string,
  data: {
    orderId: string;
    driverId: string;
    vehicleId: string;
    timestamp: string;
    correlationId: string;
    state: string;
    reason?: string;
  },
): Promise<void> => {
  const event = buildEventEnvelope(eventType, "delivery-service", orderId, data);

  await publishEvent(DELIVERY_EVENTS_TOPIC, event, orderId);
};

const transitionDelivery = async (
  orderId: string,
  nextState: (typeof DELIVERY_STATES)[keyof typeof DELIVERY_STATES],
  eventType: string,
  extraSet: Record<string, unknown> = {},
): Promise<void> => {
  const delivery = await getDeliveryByOrderId(orderId);
  validateTransition(delivery.currentState, nextState);

  const updated = await Delivery.findOneAndUpdate(
    { orderId },
    {
      $set: {
        currentState: nextState,
        ...extraSet,
        updatedAt: new Date(),
      },
      $inc: { version: 1 },
    },
    { new: true },
  ).lean();

  if (!updated) {
    throw new AppError(
      `Failed to update delivery for orderId: ${orderId}`,
      500,
      "DELIVERY_UPDATE_FAILED",
    );
  }

  if (updated.currentState === DELIVERY_STATES.ASSIGNED) {
    await setActiveDelivery(updated);
  } else if (updated.currentState === DELIVERY_STATES.OUT_FOR_DELIVERY) {
    await updateActiveDelivery(updated);
  } else if (
    updated.currentState === DELIVERY_STATES.DELIVERED ||
    updated.currentState === DELIVERY_STATES.FAILED ||
    updated.currentState === DELIVERY_STATES.RETURNED
  ) {
    await removeActiveDelivery(orderId);
  }

  await emitDeliveryEvent(orderId, eventType, {
    eventType,
    orderId,
    driverId: updated.driverId,
    vehicleId: updated.vehicleId,
    timestamp: new Date(updated.updatedAt ?? new Date()).toISOString(),
    correlationId: orderId,
    state: updated.currentState,
    reason:
      typeof updated.failureReason === "string"
        ? updated.failureReason
        : undefined,
  } as unknown as {
    orderId: string;
    driverId: string;
    vehicleId: string;
    timestamp: string;
    correlationId: string;
    state: string;
    reason?: string;
  });
};

export const createDeliveryFromPlan = async (
  event: PlanConfirmedEvent,
): Promise<void> => {
  validateEvent(event);

  const eventId = event.eventId.trim();

  const existingProcessedEvent = await ProcessedEvent.findOne({ eventId })
    .lean()
    .exec();

  if (existingProcessedEvent) {
    return;
  }

  await Delivery.updateOne(
    { orderId: event.data.orderId.trim() },
    {
      $setOnInsert: {
        orderId: event.data.orderId.trim(),
        franchiseId: event.data.franchiseId.trim(),
        vehicleId: event.data.vehicleId.trim(),
        driverId: event.data.driverId.trim(),
        currentState: DELIVERY_STATES.PLANNED,
        plannedAt: parseDate(event.data.plannedAt, event.occurredAt),
        version: 1,
      },
    },
    { upsert: true },
  ).exec();

  await ProcessedEvent.updateOne(
    { eventId },
    { $setOnInsert: { eventId, processedAt: new Date() } },
    { upsert: true },
  ).exec();
};

export const assignDelivery = async (
  orderId: string,
  driverId: string,
  vehicleId: string,
): Promise<void> => {
  await transitionDelivery(
    orderId,
    DELIVERY_STATES.ASSIGNED,
    DELIVERY_EVENTS.DELIVERY_ASSIGNED,
    {
      driverId,
      vehicleId,
      failureReason: undefined,
    },
  );
};

export const startDelivery = async (orderId: string): Promise<void> => {
  await transitionDelivery(
    orderId,
    DELIVERY_STATES.OUT_FOR_DELIVERY,
    DELIVERY_EVENTS.DELIVERY_STARTED,
  );
};

export const completeDelivery = async (orderId: string): Promise<void> => {
  await transitionDelivery(
    orderId,
    DELIVERY_STATES.DELIVERED,
    DELIVERY_EVENTS.DELIVERY_COMPLETED,
  );
};

export const failDelivery = async (
  orderId: string,
  reason: string,
): Promise<void> => {
  if (!reason.trim()) {
    throw new AppError(
      "Failure reason is required",
      400,
      "FAILURE_REASON_REQUIRED",
    );
  }

  await transitionDelivery(
    orderId,
    DELIVERY_STATES.FAILED,
    DELIVERY_EVENTS.DELIVERY_FAILED,
    { failureReason: reason.trim() },
  );
};

export const returnDelivery = async (orderId: string): Promise<void> => {
  await transitionDelivery(
    orderId,
    DELIVERY_STATES.RETURNED,
    DELIVERY_EVENTS.DELIVERY_RETURNED,
  );
};
