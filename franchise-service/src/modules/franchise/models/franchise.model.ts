import { Document, Schema, model } from "mongoose";

export interface IFranchise extends Document {
  id: string;
  name: string;
  city: string;
  state: string;
  region: string;
  createdAt: Date;
  updatedAt: Date;
}

const franchiseSchema = new Schema<IFranchise>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Franchise = model<IFranchise>("Franchise", franchiseSchema);

export default Franchise;
