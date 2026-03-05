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

const DELIVERY_EVENTS_TOPIC = "logistics.delivery.events";

const parseDate = (value: string | undefined, fallback: string): Date => {
  const source = value ?? fallback;
  const date = new Date(source);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid plannedAt/occurredAt date");
  }

  return date;
};

const validateEvent = (event: PlanConfirmedEvent): void => {
  if (!event.eventId?.trim()) {
    throw new Error("Invalid eventId");
  }

  if (!event.data?.orderId?.trim()) {
    throw new Error("Invalid orderId");
  }

  if (!event.data.franchiseId?.trim()) {
    throw new Error("Invalid franchiseId");
  }

  if (!event.data.vehicleId?.trim()) {
    throw new Error("Invalid vehicleId");
  }

  if (!event.data.driverId?.trim()) {
    throw new Error("Invalid driverId");
  }

  if (!event.occurredAt?.trim()) {
    throw new Error("Invalid occurredAt");
  }
};

const getDeliveryByOrderId = async (orderId: string) => {
  const delivery = await Delivery.findOne({ orderId }).exec();

  if (!delivery) {
    throw new Error(`Delivery not found for orderId: ${orderId}`);
  }

  return delivery;
};

const emitDeliveryEvent = async (
  orderId: string,
  eventType: string,
  data: Record<string, unknown>,
): Promise<void> => {
  const event = buildEventEnvelope(
    eventType,
    "delivery-service",
    orderId,
    data,
  );

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
    throw new Error(`Failed to update delivery for orderId: ${orderId}`);
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
    orderId,
    currentState: updated.currentState,
    version: updated.version,
    plannedAt: updated.plannedAt,
    franchiseId: updated.franchiseId,
    vehicleId: updated.vehicleId,
    driverId: updated.driverId,
    failureReason: updated.failureReason,
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

export const assignDelivery = async (orderId: string): Promise<void> => {
  await transitionDelivery(
    orderId,
    DELIVERY_STATES.ASSIGNED,
    DELIVERY_EVENTS.DELIVERY_ASSIGNED,
    { failureReason: undefined },
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
    throw new Error("Failure reason is required");
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
