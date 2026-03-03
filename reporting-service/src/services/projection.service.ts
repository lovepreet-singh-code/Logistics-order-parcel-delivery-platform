import { DailyAggregates } from "../models/dailyAggregates.model";
import { DeliveryMetrics } from "../models/deliveryMetrics.model";
import { OrderMetrics } from "../models/orderMetrics.model";
import { PlanningMetrics } from "../models/planningMetrics.model";
import { RevenueMetrics } from "../models/revenueMetrics.model";
import type { EventEnvelope } from "../types/event";

const GLOBAL_KEY = "global";

const getDateKey = (occurredAt: string): string => {
  const date = new Date(occurredAt);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid occurredAt");
  }

  return date.toISOString().slice(0, 10);
};

const toAmount = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

export const applyProjection = async (event: EventEnvelope): Promise<void> => {
  const dateKey = getDateKey(event.occurredAt);

  switch (event.eventType) {
    case "OrderCreated": {
      await Promise.all([
        OrderMetrics.updateOne(
          { key: GLOBAL_KEY },
          {
            $setOnInsert: { key: GLOBAL_KEY, totalOrders: 0, createdOrders: 0, cancelledOrders: 0 },
            $inc: { totalOrders: 1, createdOrders: 1 },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        ).exec(),
        DailyAggregates.updateOne(
          { date: dateKey },
          {
            $setOnInsert: { date: dateKey },
            $inc: { totalOrders: 1 },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        ).exec(),
      ]);
      return;
    }

    case "OrderCancelled": {
      await Promise.all([
        OrderMetrics.updateOne(
          { key: GLOBAL_KEY },
          {
            $setOnInsert: { key: GLOBAL_KEY, totalOrders: 0, createdOrders: 0, cancelledOrders: 0 },
            $inc: { cancelledOrders: 1 },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        ).exec(),
      ]);
      return;
    }

    case "PlanningCreated": {
      await Promise.all([
        PlanningMetrics.updateOne(
          { key: GLOBAL_KEY },
          {
            $setOnInsert: { key: GLOBAL_KEY, planningCreated: 0, planningUpdated: 0, planningFailed: 0 },
            $inc: { planningCreated: 1 },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        ).exec(),
        DailyAggregates.updateOne(
          { date: dateKey },
          {
            $setOnInsert: { date: dateKey },
            $inc: { plannedOrders: 1 },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        ).exec(),
      ]);
      return;
    }

    case "PlanningUpdated": {
      await PlanningMetrics.updateOne(
        { key: GLOBAL_KEY },
        {
          $setOnInsert: { key: GLOBAL_KEY, planningCreated: 0, planningUpdated: 0, planningFailed: 0 },
          $inc: { planningUpdated: 1 },
          $set: { updatedAt: new Date() },
        },
        { upsert: true },
      ).exec();
      return;
    }

    case "PlanningFailed": {
      await PlanningMetrics.updateOne(
        { key: GLOBAL_KEY },
        {
          $setOnInsert: { key: GLOBAL_KEY, planningCreated: 0, planningUpdated: 0, planningFailed: 0 },
          $inc: { planningFailed: 1 },
          $set: { updatedAt: new Date() },
        },
        { upsert: true },
      ).exec();
      return;
    }

    case "DeliveryAssigned": {
      await DeliveryMetrics.updateOne(
        { key: GLOBAL_KEY },
        {
          $setOnInsert: {
            key: GLOBAL_KEY,
            assignedDeliveries: 0,
            inTransitDeliveries: 0,
            deliveredOrders: 0,
            failedDeliveries: 0,
            trackingEvents: 0,
          },
          $inc: { assignedDeliveries: 1 },
          $set: { updatedAt: new Date() },
        },
        { upsert: true },
      ).exec();
      return;
    }

    case "OutForDelivery": {
      await DeliveryMetrics.updateOne(
        { key: GLOBAL_KEY },
        {
          $setOnInsert: {
            key: GLOBAL_KEY,
            assignedDeliveries: 0,
            inTransitDeliveries: 0,
            deliveredOrders: 0,
            failedDeliveries: 0,
            trackingEvents: 0,
          },
          $inc: { inTransitDeliveries: 1 },
          $set: { updatedAt: new Date() },
        },
        { upsert: true },
      ).exec();
      return;
    }

    case "Delivered": {
      await Promise.all([
        DeliveryMetrics.updateOne(
          { key: GLOBAL_KEY },
          {
            $setOnInsert: {
              key: GLOBAL_KEY,
              assignedDeliveries: 0,
              inTransitDeliveries: 0,
              deliveredOrders: 0,
              failedDeliveries: 0,
              trackingEvents: 0,
            },
            $inc: { deliveredOrders: 1 },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        ).exec(),
        DailyAggregates.updateOne(
          { date: dateKey },
          {
            $setOnInsert: { date: dateKey },
            $inc: { deliveredOrders: 1 },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        ).exec(),
      ]);
      return;
    }

    case "DeliveryFailed": {
      await Promise.all([
        DeliveryMetrics.updateOne(
          { key: GLOBAL_KEY },
          {
            $setOnInsert: {
              key: GLOBAL_KEY,
              assignedDeliveries: 0,
              inTransitDeliveries: 0,
              deliveredOrders: 0,
              failedDeliveries: 0,
              trackingEvents: 0,
            },
            $inc: { failedDeliveries: 1 },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        ).exec(),
        DailyAggregates.updateOne(
          { date: dateKey },
          {
            $setOnInsert: { date: dateKey },
            $inc: { failedDeliveries: 1 },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        ).exec(),
      ]);
      return;
    }

    case "TrackingUpdated": {
      await Promise.all([
        DeliveryMetrics.updateOne(
          { key: GLOBAL_KEY },
          {
            $setOnInsert: {
              key: GLOBAL_KEY,
              assignedDeliveries: 0,
              inTransitDeliveries: 0,
              deliveredOrders: 0,
              failedDeliveries: 0,
              trackingEvents: 0,
            },
            $inc: { trackingEvents: 1 },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        ).exec(),
        DailyAggregates.updateOne(
          { date: dateKey },
          {
            $setOnInsert: { date: dateKey },
            $inc: { trackingEvents: 1 },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        ).exec(),
      ]);
      return;
    }

    case "PaymentCompleted": {
      const amount = toAmount(event.data.amount);

      await Promise.all([
        RevenueMetrics.updateOne(
          { key: GLOBAL_KEY },
          {
            $setOnInsert: {
              key: GLOBAL_KEY,
              totalRevenue: 0,
              successfulPayments: 0,
              failedPayments: 0,
              refundedAmount: 0,
            },
            $inc: { totalRevenue: amount, successfulPayments: 1 },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        ).exec(),
        DailyAggregates.updateOne(
          { date: dateKey },
          {
            $setOnInsert: { date: dateKey },
            $inc: { revenue: amount, successfulPayments: 1 },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        ).exec(),
      ]);
      return;
    }

    case "PaymentFailed": {
      await Promise.all([
        RevenueMetrics.updateOne(
          { key: GLOBAL_KEY },
          {
            $setOnInsert: {
              key: GLOBAL_KEY,
              totalRevenue: 0,
              successfulPayments: 0,
              failedPayments: 0,
              refundedAmount: 0,
            },
            $inc: { failedPayments: 1 },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        ).exec(),
        DailyAggregates.updateOne(
          { date: dateKey },
          {
            $setOnInsert: { date: dateKey },
            $inc: { failedPayments: 1 },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        ).exec(),
      ]);
      return;
    }

    case "PaymentRefunded": {
      const amount = toAmount(event.data.amount);

      await RevenueMetrics.updateOne(
        { key: GLOBAL_KEY },
        {
          $setOnInsert: {
            key: GLOBAL_KEY,
            totalRevenue: 0,
            successfulPayments: 0,
            failedPayments: 0,
            refundedAmount: 0,
          },
          $inc: { refundedAmount: amount },
          $set: { updatedAt: new Date() },
        },
        { upsert: true },
      ).exec();
      return;
    }

    default:
      return;
  }
};
