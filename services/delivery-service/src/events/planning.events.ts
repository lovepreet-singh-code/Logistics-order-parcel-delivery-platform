export const PLANNING_EVENTS = {
  PLAN_CONFIRMED: "PLAN_CONFIRMED",
} as const;

export type PlanningEventType =
  (typeof PLANNING_EVENTS)[keyof typeof PLANNING_EVENTS];

export type PlanConfirmedEvent = {
  eventId: string;
  eventType: PlanningEventType;
  eventVersion: number;
  occurredAt: string;
  producer: string;
  correlationId: string;
  data: {
    orderId: string;
    franchiseId: string;
    vehicleId: string;
    driverId: string;
    plannedAt?: string;
  };
};
