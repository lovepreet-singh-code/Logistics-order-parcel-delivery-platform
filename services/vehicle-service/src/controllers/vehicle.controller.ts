import { type NextFunction, type Request, type Response } from "express";
import {
  type CreateVehiclePayload,
  type UpdateVehiclePayload,
  type VehicleFilters,
  vehicleService,
} from "../services/vehicle.service";
import { sendSuccess } from "../utils/apiResponse";

export const createVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = req.body as CreateVehiclePayload;
    const vehicle = await vehicleService.createVehicle(payload);

    sendSuccess(res, 201, "Vehicle created successfully", vehicle);
  } catch (error) {
    next(error);
  }
};

export const getVehicles = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const filters: VehicleFilters = {
      status:
        typeof req.query.status === "string"
          ? (req.query.status as VehicleFilters["status"])
          : undefined,
      vehicleType:
        typeof req.query.vehicleType === "string"
          ? (req.query.vehicleType as VehicleFilters["vehicleType"])
          : undefined,
      franchiseId:
        typeof req.query.franchiseId === "string"
          ? req.query.franchiseId
          : undefined,
    };

    const vehicles = await vehicleService.getVehicles(filters);

    sendSuccess(res, 200, "Vehicles fetched successfully", vehicles);
  } catch (error) {
    next(error);
  }
};

export const getVehicleById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);

    sendSuccess(res, 200, "Vehicle fetched successfully", vehicle);
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = req.body as UpdateVehiclePayload;
    const updatedVehicle = await vehicleService.updateVehicle(req.params.id, payload);

    sendSuccess(res, 200, "Vehicle updated successfully", updatedVehicle);
  } catch (error) {
    next(error);
  }
};

export const updateVehicleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { status } = req.body as { status?: string };
    const updatedVehicle = await vehicleService.updateVehicleStatus(
      req.params.id,
      status as NonNullable<VehicleFilters["status"]>,
    );

    sendSuccess(res, 200, "Vehicle status updated successfully", updatedVehicle);
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await vehicleService.softDeleteVehicle(req.params.id);

    sendSuccess(res, 200, "Vehicle deleted successfully");
  } catch (error) {
    next(error);
  }
};
