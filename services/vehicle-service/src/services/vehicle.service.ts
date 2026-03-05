import { Types } from "mongoose";
import {
  Vehicle,
  VEHICLE_STATUSES,
  VEHICLE_TYPES,
  type ICurrentLocation,
  type VehicleDocument,
  type VehicleStatus,
  type VehicleType,
} from "../models/vehicle.model";
import { AppError } from "../middlewares/error.middleware";

export interface CreateVehiclePayload {
  vehicleNumber: string;
  vehicleType: VehicleType;
  capacityKg: number;
  franchiseId: string;
  driverId: string;
  status: VehicleStatus;
  currentLocation: ICurrentLocation;
}

export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;

export interface VehicleFilters {
  status?: VehicleStatus;
  vehicleType?: VehicleType;
  franchiseId?: string;
}

const isValidVehicleType = (value: unknown): value is VehicleType => {
  return typeof value === "string" && VEHICLE_TYPES.includes(value as VehicleType);
};

const isValidVehicleStatus = (value: unknown): value is VehicleStatus => {
  return (
    typeof value === "string" &&
    VEHICLE_STATUSES.includes(value as VehicleStatus)
  );
};

const validateObjectId = (value: string, fieldName: string): void => {
  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(400, `${fieldName} must be a valid ObjectId string`);
  }
};

const validateCurrentLocation = (currentLocation: ICurrentLocation): void => {
  if (
    typeof currentLocation.latitude !== "number" ||
    Number.isNaN(currentLocation.latitude)
  ) {
    throw new AppError(400, "currentLocation.latitude must be a valid number");
  }

  if (
    typeof currentLocation.longitude !== "number" ||
    Number.isNaN(currentLocation.longitude)
  ) {
    throw new AppError(400, "currentLocation.longitude must be a valid number");
  }

  if (currentLocation.latitude < -90 || currentLocation.latitude > 90) {
    throw new AppError(400, "currentLocation.latitude must be between -90 and 90");
  }

  if (currentLocation.longitude < -180 || currentLocation.longitude > 180) {
    throw new AppError(
      400,
      "currentLocation.longitude must be between -180 and 180",
    );
  }
};

const validateCreatePayload = (payload: CreateVehiclePayload): void => {
  if (!payload.vehicleNumber?.trim()) {
    throw new AppError(400, "vehicleNumber is required");
  }

  if (!isValidVehicleType(payload.vehicleType)) {
    throw new AppError(400, "vehicleType must be BIKE, VAN, or TRUCK");
  }

  if (typeof payload.capacityKg !== "number" || payload.capacityKg <= 0) {
    throw new AppError(400, "capacityKg must be a positive number");
  }

  if (!payload.franchiseId?.trim()) {
    throw new AppError(400, "franchiseId is required");
  }

  if (!payload.driverId?.trim()) {
    throw new AppError(400, "driverId is required");
  }

  validateObjectId(payload.franchiseId, "franchiseId");
  validateObjectId(payload.driverId, "driverId");

  if (!isValidVehicleStatus(payload.status)) {
    throw new AppError(
      400,
      "status must be AVAILABLE, IN_TRANSIT, or MAINTENANCE",
    );
  }

  if (!payload.currentLocation) {
    throw new AppError(400, "currentLocation is required");
  }

  validateCurrentLocation(payload.currentLocation);
};

const validateUpdatePayload = (payload: UpdateVehiclePayload): void => {
  if (Object.keys(payload).length === 0) {
    throw new AppError(400, "At least one field is required for update");
  }

  if (payload.vehicleNumber !== undefined && !payload.vehicleNumber.trim()) {
    throw new AppError(400, "vehicleNumber cannot be empty");
  }

  if (payload.vehicleType !== undefined && !isValidVehicleType(payload.vehicleType)) {
    throw new AppError(400, "vehicleType must be BIKE, VAN, or TRUCK");
  }

  if (
    payload.capacityKg !== undefined &&
    (typeof payload.capacityKg !== "number" || payload.capacityKg <= 0)
  ) {
    throw new AppError(400, "capacityKg must be a positive number");
  }

  if (payload.franchiseId !== undefined) {
    if (!payload.franchiseId.trim()) {
      throw new AppError(400, "franchiseId cannot be empty");
    }

    validateObjectId(payload.franchiseId, "franchiseId");
  }

  if (payload.driverId !== undefined) {
    if (!payload.driverId.trim()) {
      throw new AppError(400, "driverId cannot be empty");
    }

    validateObjectId(payload.driverId, "driverId");
  }

  if (payload.status !== undefined && !isValidVehicleStatus(payload.status)) {
    throw new AppError(
      400,
      "status must be AVAILABLE, IN_TRANSIT, or MAINTENANCE",
    );
  }

  if (payload.currentLocation !== undefined) {
    validateCurrentLocation(payload.currentLocation);
  }
};

const validateVehicleId = (id: string): void => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid vehicle id");
  }
};

const ensureVehicleNumberUnique = async (
  vehicleNumber: string,
  excludeId?: string,
): Promise<void> => {
  const query: { vehicleNumber: string; _id?: { $ne: string } } = {
    vehicleNumber: vehicleNumber.trim().toUpperCase(),
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingVehicle = await Vehicle.findOne(query).lean().exec();

  if (existingVehicle) {
    throw new AppError(409, "vehicleNumber already exists");
  }
};

const buildVehicleFilters = (filters: VehicleFilters): Record<string, unknown> => {
  const query: Record<string, unknown> = { isActive: true };

  if (filters.status !== undefined) {
    if (!isValidVehicleStatus(filters.status)) {
      throw new AppError(
        400,
        "status must be AVAILABLE, IN_TRANSIT, or MAINTENANCE",
      );
    }

    query.status = filters.status;
  }

  if (filters.vehicleType !== undefined) {
    if (!isValidVehicleType(filters.vehicleType)) {
      throw new AppError(400, "vehicleType must be BIKE, VAN, or TRUCK");
    }

    query.vehicleType = filters.vehicleType;
  }

  if (filters.franchiseId !== undefined) {
    if (!filters.franchiseId.trim()) {
      throw new AppError(400, "franchiseId cannot be empty");
    }

    validateObjectId(filters.franchiseId, "franchiseId");
    query.franchiseId = filters.franchiseId;
  }

  return query;
};

export const vehicleService = {
  createVehicle: async (payload: CreateVehiclePayload): Promise<VehicleDocument> => {
    validateCreatePayload(payload);
    await ensureVehicleNumberUnique(payload.vehicleNumber);

    const vehicle = await Vehicle.create({
      vehicleNumber: payload.vehicleNumber.trim().toUpperCase(),
      vehicleType: payload.vehicleType,
      capacityKg: payload.capacityKg,
      franchiseId: payload.franchiseId.trim(),
      driverId: payload.driverId.trim(),
      status: payload.status,
      currentLocation: payload.currentLocation,
      isActive: true,
    });

    return vehicle;
  },

  getVehicles: async (filters: VehicleFilters): Promise<VehicleDocument[]> => {
    const query = buildVehicleFilters(filters);
    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 }).exec();

    return vehicles;
  },

  getVehicleById: async (id: string): Promise<VehicleDocument> => {
    validateVehicleId(id);

    const vehicle = await Vehicle.findOne({ _id: id, isActive: true }).exec();

    if (!vehicle) {
      throw new AppError(404, "Vehicle not found");
    }

    return vehicle;
  },

  updateVehicle: async (
    id: string,
    payload: UpdateVehiclePayload,
  ): Promise<VehicleDocument> => {
    validateVehicleId(id);
    validateUpdatePayload(payload);

    if (payload.vehicleNumber !== undefined) {
      await ensureVehicleNumberUnique(payload.vehicleNumber, id);
    }

    const updateData: UpdateVehiclePayload = { ...payload };

    if (updateData.vehicleNumber !== undefined) {
      updateData.vehicleNumber = updateData.vehicleNumber.trim().toUpperCase();
    }

    if (updateData.franchiseId !== undefined) {
      updateData.franchiseId = updateData.franchiseId.trim();
    }

    if (updateData.driverId !== undefined) {
      updateData.driverId = updateData.driverId.trim();
    }

    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: updateData },
      { new: true, runValidators: true },
    ).exec();

    if (!updatedVehicle) {
      throw new AppError(404, "Vehicle not found");
    }

    return updatedVehicle;
  },

  updateVehicleStatus: async (
    id: string,
    status: VehicleStatus,
  ): Promise<VehicleDocument> => {
    validateVehicleId(id);

    if (!isValidVehicleStatus(status)) {
      throw new AppError(400, "status must be AVAILABLE, IN_TRANSIT, or MAINTENANCE");
    }

    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { status } },
      { new: true, runValidators: true },
    ).exec();

    if (!updatedVehicle) {
      throw new AppError(404, "Vehicle not found");
    }

    return updatedVehicle;
  },

  softDeleteVehicle: async (id: string): Promise<void> => {
    validateVehicleId(id);

    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { isActive: false } },
      { new: true },
    ).exec();

    if (!updatedVehicle) {
      throw new AppError(404, "Vehicle not found");
    }
  },
};
