import { type HydratedDocument, type Model, Schema, model } from "mongoose";

export interface IVehicleUtilization {
  vehicleId: string;
  assignedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  updatedAt: Date;
}

export type VehicleUtilizationDocument = HydratedDocument<IVehicleUtilization>;

type VehicleUtilizationModel = Model<IVehicleUtilization>;

const vehicleUtilizationSchema = new Schema<
  IVehicleUtilization,
  VehicleUtilizationModel
>(
  {
    vehicleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    assignedOrders: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    deliveredOrders: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    cancelledOrders: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: false,
  },
);

vehicleUtilizationSchema.index({ vehicleId: 1 }, { unique: true });

export const VehicleUtilization = model<
  IVehicleUtilization,
  VehicleUtilizationModel
>("VehicleUtilization", vehicleUtilizationSchema);
