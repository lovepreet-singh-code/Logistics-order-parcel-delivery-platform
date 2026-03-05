import type { DomainEvent } from "../services/projection.service";
import { applyPlanConfirmedProjection } from "../services/projection.service";

export const PLANNING_TOPIC = "logistics.planning.events";

export const handlePlanningEvent = async (event: DomainEvent): Promise<void> => {
  if (event.eventType !== "PLAN_CONFIRMED") {
    return;
  }

  await applyPlanConfirmedProjection(event);
};
