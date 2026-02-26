import { Document, Schema, model } from "mongoose";

export interface IAuthUser extends Document {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const authUserSchema = new Schema<IAuthUser>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
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
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "user",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const AuthUser = model<IAuthUser>("AuthUser", authUserSchema);

export default AuthUser;
