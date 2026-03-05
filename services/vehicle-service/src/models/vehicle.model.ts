import {
  type HydratedDocument,
  type Model,
  Schema,
  model,
} from "mongoose";

export const VEHICLE_TYPES = ["BIKE", "VAN", "TRUCK"] as const;
export const VEHICLE_STATUSES = [
  "AVAILABLE",
  "IN_TRANSIT",
  "MAINTENANCE",
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export interface ICurrentLocation {
  latitude: number;
  longitude: number;
}

export interface IVehicle {
  vehicleNumber: string;
  vehicleType: VehicleType;
  capacityKg: number;
  franchiseId: string;
  driverId: string;
  status: VehicleStatus;
  currentLocation: ICurrentLocation;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type VehicleDocument = HydratedDocument<IVehicle>;

type VehicleModel = Model<IVehicle>;

const currentLocationSchema = new Schema<ICurrentLocation>(
  {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
  },
  { _id: false },
);

const vehicleSchema = new Schema<IVehicle, VehicleModel>(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    vehicleType: {
      type: String,
      required: true,
      enum: VEHICLE_TYPES,
    },
    capacityKg: {
      type: Number,
      required: true,
      min: 1,
    },
    franchiseId: {
      type: String,
      required: true,
      trim: true,
    },
    driverId: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: VEHICLE_STATUSES,
      default: "AVAILABLE",
    },
    currentLocation: {
      type: currentLocationSchema,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

vehicleSchema.index({ status: 1, vehicleType: 1, franchiseId: 1 });

export const Vehicle = model<IVehicle, VehicleModel>("Vehicle", vehicleSchema);
