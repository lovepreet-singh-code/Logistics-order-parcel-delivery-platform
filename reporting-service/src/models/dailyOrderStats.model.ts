import { type HydratedDocument, type Model, Schema, model } from "mongoose";

export interface IDailyOrderStats {
  date: string;
  totalOrders: number;
  delivered: number;
  cancelled: number;
  updatedAt: Date;
}

export type DailyOrderStatsDocument = HydratedDocument<IDailyOrderStats>;

type DailyOrderStatsModel = Model<IDailyOrderStats>;

const dailyOrderStatsSchema = new Schema<IDailyOrderStats, DailyOrderStatsModel>(
  {
    date: {
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

dailyOrderStatsSchema.index({ date: 1 }, { unique: true });

export const DailyOrderStats = model<IDailyOrderStats, DailyOrderStatsModel>(
  "DailyOrderStats",
  dailyOrderStatsSchema,
);
