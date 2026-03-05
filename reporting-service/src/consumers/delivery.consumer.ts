import type { DomainEvent } from "../services/projection.service";
import {
  applyDeliveryCompletedProjection,
  applyDeliveryFailedProjection,
} from "../services/projection.service";

export const DELIVERY_TOPIC = "logistics.delivery.events";

export const handleDeliveryEvent = async (event: DomainEvent): Promise<void> => {
  if (event.eventType === "DELIVERY_COMPLETED") {
    await applyDeliveryCompletedProjection(event);
    return;
  }

  if (event.eventType === "DELIVERY_FAILED") {
    await applyDeliveryFailedProjection(event);
  }
};
