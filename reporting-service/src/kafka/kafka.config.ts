import { Kafka } from "kafkajs";
import { env } from "../config/env";

export const kafka = new Kafka({
  clientId: "reporting-service",
  brokers: [env.kafkaBroker],
});
