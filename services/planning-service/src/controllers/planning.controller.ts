import { type NextFunction, type Request, type Response } from "express";
import {
  type CreatePlanningPayload,
  type PlanningFilters,
  planningService,
} from "../services/planning.service";
import { sendSuccess } from "../utils/apiResponse";

export const createPlanning = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = req.body as CreatePlanningPayload;
    const planning = await planningService.createPlanning(payload);

    sendSuccess(res, 201, "Planning created successfully", planning);
  } catch (error) {
    next(error);
  }
};

export const getPlannings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const filters: PlanningFilters = {
      planningStatus:
        typeof req.query.planningStatus === "string"
          ? (req.query.planningStatus as PlanningFilters["planningStatus"])
          : undefined,
      vehicleId:
        typeof req.query.vehicleId === "string" ? req.query.vehicleId : undefined,
      franchiseId:
        typeof req.query.franchiseId === "string"
          ? req.query.franchiseId
          : undefined,
    };

    const plannings = await planningService.getPlannings(filters);

    sendSuccess(res, 200, "Plannings fetched successfully", plannings);
  } catch (error) {
    next(error);
  }
};

export const getPlanningById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const planning = await planningService.getPlanningById(req.params.id);

    sendSuccess(res, 200, "Planning fetched successfully", planning);
  } catch (error) {
    next(error);
  }
};

export const updatePlanningStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { planningStatus } = req.body as { planningStatus?: string };

    const updatedPlanning = await planningService.updatePlanningStatus(
      req.params.id,
      planningStatus as NonNullable<PlanningFilters["planningStatus"]>,
    );

    sendSuccess(res, 200, "Planning status updated successfully", updatedPlanning);
  } catch (error) {
    next(error);
  }
};

export const deletePlanning = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await planningService.softDeletePlanning(req.params.id);

    sendSuccess(res, 200, "Planning deleted successfully");
  } catch (error) {
    next(error);
  }
};
