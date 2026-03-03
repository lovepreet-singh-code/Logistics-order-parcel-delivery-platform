# Kafka Topics

This document defines the initial Phase-2 Kafka topics for LogisticsHub.

## Topic List

- `logistics.order.events`
- `logistics.planning.events`
- `logistics.delivery.events`
- `logistics.tracking.events`
- `logistics.payment.events`

## Naming Convention

- Format: `logistics.<domain>.<event-stream>`
- Prefix `logistics` identifies platform scope.
- Domain segment maps to bounded context.
- Suffix `events` indicates append-only event stream topics.
