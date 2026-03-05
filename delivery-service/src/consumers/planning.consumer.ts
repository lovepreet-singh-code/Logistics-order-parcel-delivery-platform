import type { Consumer } from "kafkajs";
import {
  PLANNING_EVENTS,
  type PlanConfirmedEvent,
} from "../events/planning.events";
import { createDeliveryFromPlan } from "../services/delivery.service";
import { wait } from "../utils/wait";

const TOPIC = "logistics.planning.events";

const parseEvent = (value: string): PlanConfirmedEvent | null => {
  try {
    return JSON.parse(value) as PlanConfirmedEvent;
  } catch {
    return null;
  }
};

const processWithRetry = async (event: PlanConfirmedEvent): Promise<void> => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await createDeliveryFromPlan(event);
      return;
    } catch (error) {
      if (attempt === 3) {
        console.error("Failed to process PLAN_CONFIRMED event", error);
        return;
      }

      await wait(500 * attempt);
    }
  }
};

export const registerPlanningConsumer = async (
  consumer: Consumer,
): Promise<void> => {
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        return;
      }

      const event = parseEvent(message.value.toString());

      if (!event) {
        return;
      }

      if (event.eventType !== PLANNING_EVENTS.PLAN_CONFIRMED) {
        return;
      }

      await processWithRetry(event);
    },
  });
};
