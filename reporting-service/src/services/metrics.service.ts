import { DailyAggregates } from "../models/dailyAggregates.model";
import { DeliveryMetrics } from "../models/deliveryMetrics.model";
import { OrderMetrics } from "../models/orderMetrics.model";

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
