import { Document, Schema, model } from "mongoose";

export type UserRole = "ADMIN" | "MANAGER" | "DELIVERY" | "CUSTOMER";

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  assigned_area: string;
  franchise_id: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
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
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["ADMIN", "MANAGER", "DELIVERY", "CUSTOMER"],
    },
    assigned_area: {
      type: String,
      required: true,
      default: "",
      trim: true,
    },
    franchise_id: {
      type: String,
      required: true,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const User = model<IUser>("User", userSchema);

export default User;
