import { Document, Schema, model } from "mongoose";

export interface IRevokedToken extends Document {
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const revokedTokenSchema = new Schema<IRevokedToken>(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

revokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RevokedToken = model<IRevokedToken>("RevokedToken", revokedTokenSchema);

export default RevokedToken;
