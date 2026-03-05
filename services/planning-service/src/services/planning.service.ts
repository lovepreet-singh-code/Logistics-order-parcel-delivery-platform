import { Types } from "mongoose";
import {
  Planning,
  PLANNING_STATUSES,
  type PlanningDocument,
  type PlanningStatus,
} from "../models/planning.model";
import { AppError } from "../middlewares/error.middleware";

export interface CreatePlanningPayload {
  orderId: string;
  vehicleId: string;
  franchiseId: string;
  scheduledPickupTime: Date | string;
  scheduledDeliveryTime: Date | string;
  routeSummary: string;
  estimatedDistanceKm: number;
  estimatedDurationMinutes: number;
  loadWeightKg: number;
  planningStatus?: PlanningStatus;
}

export interface PlanningFilters {
  planningStatus?: PlanningStatus;
  vehicleId?: string;
  franchiseId?: string;
}

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const isValidPlanningStatus = (value: unknown): value is PlanningStatus => {
  return (
    typeof value === "string" &&
    PLANNING_STATUSES.includes(value as PlanningStatus)
  );
};

const validatePlanningId = (id: string): void => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid planning id");
  }
};

const parseDate = (value: Date | string, fieldName: string): Date => {
  const parsedDate = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError(400, `${fieldName} must be a valid date`);
  }

  return parsedDate;
};

const validatePositiveNumber = (value: unknown, fieldName: string): void => {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw new AppError(400, `${fieldName} must be a non-negative number`);
  }
};

const validateCreatePayload = (payload: CreatePlanningPayload): void => {
  if (!isNonEmptyString(payload.orderId)) {
    throw new AppError(400, "orderId is required");
  }

  if (!isNonEmptyString(payload.vehicleId)) {
    throw new AppError(400, "vehicleId is required");
  }

  if (!isNonEmptyString(payload.franchiseId)) {
    throw new AppError(400, "franchiseId is required");
  }

  if (!isNonEmptyString(payload.routeSummary)) {
    throw new AppError(400, "routeSummary is required");
  }

  const pickupDate = parseDate(payload.scheduledPickupTime, "scheduledPickupTime");
  const deliveryDate = parseDate(
    payload.scheduledDeliveryTime,
    "scheduledDeliveryTime",
  );

  if (deliveryDate.getTime() <= pickupDate.getTime()) {
    throw new AppError(
      400,
      "scheduledDeliveryTime must be greater than scheduledPickupTime",
    );
  }

  validatePositiveNumber(payload.estimatedDistanceKm, "estimatedDistanceKm");
  validatePositiveNumber(
    payload.estimatedDurationMinutes,
    "estimatedDurationMinutes",
  );
  validatePositiveNumber(payload.loadWeightKg, "loadWeightKg");

  if (
    payload.planningStatus !== undefined &&
    !isValidPlanningStatus(payload.planningStatus)
  ) {
    throw new AppError(
      400,
      "planningStatus must be PLANNED, DISPATCHED, COMPLETED, or CANCELLED",
    );
  }
};

const validatePlanningStatus = (planningStatus: unknown): PlanningStatus => {
  if (!isValidPlanningStatus(planningStatus)) {
    throw new AppError(
      400,
      "planningStatus must be PLANNED, DISPATCHED, COMPLETED, or CANCELLED",
    );
  }

  return planningStatus;
};

const buildPlanningFilters = (
  filters: PlanningFilters,
): Record<string, unknown> => {
  const query: Record<string, unknown> = { isActive: true };

  if (filters.planningStatus !== undefined) {
    query.planningStatus = validatePlanningStatus(filters.planningStatus);
  }

  if (filters.vehicleId !== undefined) {
    if (!isNonEmptyString(filters.vehicleId)) {
      throw new AppError(400, "vehicleId cannot be empty");
    }

    query.vehicleId = filters.vehicleId.trim();
  }

  if (filters.franchiseId !== undefined) {
    if (!isNonEmptyString(filters.franchiseId)) {
      throw new AppError(400, "franchiseId cannot be empty");
    }

    query.franchiseId = filters.franchiseId.trim();
  }

  return query;
};

export const planningService = {
  createPlanning: async (
    payload: CreatePlanningPayload,
  ): Promise<PlanningDocument> => {
    validateCreatePayload(payload);

    const pickupDate = parseDate(payload.scheduledPickupTime, "scheduledPickupTime");
    const deliveryDate = parseDate(
      payload.scheduledDeliveryTime,
      "scheduledDeliveryTime",
    );

    const planning = await Planning.create({
      orderId: payload.orderId.trim(),
      vehicleId: payload.vehicleId.trim(),
      franchiseId: payload.franchiseId.trim(),
      scheduledPickupTime: pickupDate,
      scheduledDeliveryTime: deliveryDate,
      routeSummary: payload.routeSummary.trim(),
      estimatedDistanceKm: payload.estimatedDistanceKm,
      estimatedDurationMinutes: payload.estimatedDurationMinutes,
      loadWeightKg: payload.loadWeightKg,
      planningStatus: payload.planningStatus ?? "PLANNED",
      isActive: true,
    });

    return planning;
  },

  getPlannings: async (filters: PlanningFilters): Promise<PlanningDocument[]> => {
    const query = buildPlanningFilters(filters);

    const plannings = await Planning.find(query).sort({ createdAt: -1 }).exec();

    return plannings;
  },

  getPlanningById: async (id: string): Promise<PlanningDocument> => {
    validatePlanningId(id);

    const planning = await Planning.findOne({ _id: id, isActive: true }).exec();

    if (!planning) {
      throw new AppError(404, "Planning not found");
    }

    return planning;
  },

  updatePlanningStatus: async (
    id: string,
    planningStatus: PlanningStatus,
  ): Promise<PlanningDocument> => {
    validatePlanningId(id);

    const validPlanningStatus = validatePlanningStatus(planningStatus);

    const updatedPlanning = await Planning.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { planningStatus: validPlanningStatus } },
      { new: true, runValidators: true },
    ).exec();

    if (!updatedPlanning) {
      throw new AppError(404, "Planning not found");
    }

    return updatedPlanning;
  },

  softDeletePlanning: async (id: string): Promise<void> => {
    validatePlanningId(id);

    const updatedPlanning = await Planning.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { isActive: false } },
      { new: true },
    ).exec();

    if (!updatedPlanning) {
      throw new AppError(404, "Planning not found");
    }
  },
};
