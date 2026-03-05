import {
  type HydratedDocument,
  type Model,
  Schema,
  model,
} from "mongoose";

export const PLANNING_STATUSES = [
  "PLANNED",
  "DISPATCHED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type PlanningStatus = (typeof PLANNING_STATUSES)[number];

export interface IPlanning {
  planningNumber: string;
  orderId: string;
  vehicleId: string;
  franchiseId: string;
  scheduledPickupTime: Date;
  scheduledDeliveryTime: Date;
  routeSummary: string;
  estimatedDistanceKm: number;
  estimatedDurationMinutes: number;
  loadWeightKg: number;
  planningStatus: PlanningStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PlanningDocument = HydratedDocument<IPlanning>;

type PlanningModel = Model<IPlanning>;

const generatePlanningNumberCandidate = (): string => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `PLN-${year}${month}${day}-${timestamp}${random}`;
};

const planningSchema = new Schema<IPlanning, PlanningModel>(
  {
    planningNumber: {
      type: String,
      unique: true,
      immutable: true,
      trim: true,
    },
    orderId: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleId: {
      type: String,
      required: true,
      trim: true,
    },
    franchiseId: {
      type: String,
      required: true,
      trim: true,
    },
    scheduledPickupTime: {
      type: Date,
      required: true,
    },
    scheduledDeliveryTime: {
      type: Date,
      required: true,
    },
    routeSummary: {
      type: String,
      required: true,
      trim: true,
    },
    estimatedDistanceKm: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedDurationMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    loadWeightKg: {
      type: Number,
      required: true,
      min: 0,
    },
    planningStatus: {
      type: String,
      required: true,
      enum: PLANNING_STATUSES,
      default: "PLANNED",
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

planningSchema.pre("save", async function () {
  const planningDoc = this as PlanningDocument;

  if (planningDoc.planningNumber) {
    return;
  }

  const planningModel = planningDoc.constructor as PlanningModel;
  let generatedPlanningNumber = generatePlanningNumberCandidate();

  while (await planningModel.exists({ planningNumber: generatedPlanningNumber })) {
    generatedPlanningNumber = generatePlanningNumberCandidate();
  }

  planningDoc.planningNumber = generatedPlanningNumber;
});

planningSchema.index({ planningStatus: 1, vehicleId: 1, franchiseId: 1 });

export const Planning = model<IPlanning, PlanningModel>("Planning", planningSchema);
