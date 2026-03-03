import { DailyAggregates } from "../models/dailyAggregates.model";
import { DeliveryMetrics } from "../models/deliveryMetrics.model";
import { OrderMetrics } from "../models/orderMetrics.model";
import { PlanningMetrics } from "../models/planningMetrics.model";
import { RevenueMetrics } from "../models/revenueMetrics.model";

const GLOBAL_KEY = "global";

export const getOrderMetrics = async () => {
  return OrderMetrics.findOne({ key: GLOBAL_KEY }).lean().exec();
};

export const getDeliveryMetrics = async () => {
  return DeliveryMetrics.findOne({ key: GLOBAL_KEY }).lean().exec();
};

export const getRevenueMetrics = async () => {
  return RevenueMetrics.findOne({ key: GLOBAL_KEY }).lean().exec();
};

export const getDailyMetrics = async (date: string) => {
  return DailyAggregates.findOne({ date }).lean().exec();
};

export const getSystemMetrics = async () => {
  const [orders, deliveries, planning, revenue] = await Promise.all([
    OrderMetrics.findOne({ key: GLOBAL_KEY }).lean().exec(),
    DeliveryMetrics.findOne({ key: GLOBAL_KEY }).lean().exec(),
    PlanningMetrics.findOne({ key: GLOBAL_KEY }).lean().exec(),
    RevenueMetrics.findOne({ key: GLOBAL_KEY }).lean().exec(),
  ]);

  return {
    orders,
    deliveries,
    planning,
    revenue,
  };
};
