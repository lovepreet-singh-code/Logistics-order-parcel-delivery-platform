import { redisClient } from "../config/redis";

type ActiveDeliveryCache = {
  orderId: string;
  driverId: string;
  vehicleId: string;
  state: string;
  updatedAt: string;
};

const getKey = (orderId: string): string => `delivery:active:${orderId}`;

const buildPayload = (delivery: {
  orderId: string;
  driverId: string;
  vehicleId: string;
  currentState: string;
  updatedAt?: Date | string;
}): ActiveDeliveryCache => {
  return {
    orderId: delivery.orderId,
    driverId: delivery.driverId,
    vehicleId: delivery.vehicleId,
    state: delivery.currentState,
    updatedAt: new Date(delivery.updatedAt ?? new Date()).toISOString(),
  };
};

export const setActiveDelivery = async (delivery: {
  orderId: string;
  driverId: string;
  vehicleId: string;
  currentState: string;
  updatedAt?: Date | string;
}): Promise<void> => {
  const payload = buildPayload(delivery);
  await redisClient.set(getKey(delivery.orderId), JSON.stringify(payload));
};

export const updateActiveDelivery = async (delivery: {
  orderId: string;
  driverId: string;
  vehicleId: string;
  currentState: string;
  updatedAt?: Date | string;
}): Promise<void> => {
  const payload = buildPayload(delivery);
  await redisClient.set(getKey(delivery.orderId), JSON.stringify(payload));
};

export const removeActiveDelivery = async (orderId: string): Promise<void> => {
  await redisClient.del(getKey(orderId));
};

export const getActiveDelivery = async (
  orderId: string,
): Promise<ActiveDeliveryCache | null> => {
  const raw = await redisClient.get(getKey(orderId));

  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as ActiveDeliveryCache;
};
