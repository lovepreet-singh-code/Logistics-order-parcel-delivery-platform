export const DELIVERY_STATES = {
  PLANNED: "PLANNED",
  ASSIGNED: "ASSIGNED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
  RETURNED: "RETURNED",
} as const;

export type DeliveryState =
  (typeof DELIVERY_STATES)[keyof typeof DELIVERY_STATES];

const allowedTransitions: Record<DeliveryState, DeliveryState[]> = {
  PLANNED: [DELIVERY_STATES.ASSIGNED],
  ASSIGNED: [DELIVERY_STATES.OUT_FOR_DELIVERY],
  OUT_FOR_DELIVERY: [DELIVERY_STATES.DELIVERED, DELIVERY_STATES.FAILED],
  DELIVERED: [],
  FAILED: [DELIVERY_STATES.RETURNED],
  RETURNED: [],
};

export const validateTransition = (
  currentState: DeliveryState,
  nextState: DeliveryState,
): void => {
  const allowed = allowedTransitions[currentState] ?? [];

  if (!allowed.includes(nextState)) {
    throw new Error(`Invalid transition: ${currentState} -> ${nextState}`);
  }
};
