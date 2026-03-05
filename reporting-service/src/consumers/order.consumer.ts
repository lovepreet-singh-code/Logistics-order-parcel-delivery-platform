import type { DomainEvent } from "../services/projection.service";
import { applyOrderCreatedProjection } from "../services/projection.service";

export const ORDER_TOPIC = "logistics.order.events";

export const handleOrderEvent = async (event: DomainEvent): Promise<void> => {
  if (event.eventType !== "ORDER_CREATED") {
    return;
  }

  await applyOrderCreatedProjection(event);
};
