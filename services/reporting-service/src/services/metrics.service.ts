import { DailyAggregates } from "../models/dailyAggregates.model";
import { DeliveryMetrics } from "../models/deliveryMetrics.model";
import { OrderMetrics } from "../models/orderMetrics.model";
import { SystemKpi } from "../models/systemKpi.model";

const GLOBAL_KEY = "global";

export const getOrderMetrics = async () => {
  return OrderMetrics.findOne({ key: GLOBAL_KEY }).lean().exec();
};

export const getDeliveryMetrics = async () => {
  return DeliveryMetrics.findOne({ key: GLOBAL_KEY }).lean().exec();
};

export const getDailyMetrics = async (date: string) => {
  return DailyAggregates.findOne({ date }).lean().exec();
};

export const getSystemKpi = async () => {
  return SystemKpi.findOne({ key: GLOBAL_KEY }).lean().exec();
};

export const getDeliveryKpi = async () => {
  const kpi = await SystemKpi.findOne({ key: GLOBAL_KEY }).lean().exec();

  if (!kpi) {
    return null;
  }

  return {
    totalDeliveries: kpi.totalDeliveries,
    successfulDeliveries: kpi.successfulDeliveries,
    failedDeliveries: kpi.failedDeliveries,
    successRate: kpi.successRate,
    avgDeliveryTime: kpi.avgDeliveryTime,
    lastUpdated: kpi.lastUpdated,
  };
};
