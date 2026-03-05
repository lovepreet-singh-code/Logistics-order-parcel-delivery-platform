import { Kafka } from "kafkajs";

const broker = process.env.KAFKA_BROKER || "kafka:9092";

export const kafka = new Kafka({
  clientId: "notification-service",
  brokers: [broker],
});
