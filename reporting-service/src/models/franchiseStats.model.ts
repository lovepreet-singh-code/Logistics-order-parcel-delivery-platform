import { type HydratedDocument, type Model, Schema, model } from "mongoose";

export interface IFranchiseStats {
  franchiseId: string;
  totalOrders: number;
  delivered: number;
  cancelled: number;
  updatedAt: Date;
}

export type FranchiseStatsDocument = HydratedDocument<IFranchiseStats>;

type FranchiseStatsModel = Model<IFranchiseStats>;

const franchiseStatsSchema = new Schema<IFranchiseStats, FranchiseStatsModel>(
  {
    franchiseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    totalOrders: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    delivered: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    cancelled: {
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

franchiseStatsSchema.index({ franchiseId: 1 }, { unique: true });

export const FranchiseStats = model<IFranchiseStats, FranchiseStatsModel>(
  "FranchiseStats",
  franchiseStatsSchema,
);
