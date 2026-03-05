import { Document, Schema, model } from "mongoose";

export interface IServiceablePincode extends Document {
  id: string;
  franchise_id: string;
  pincode: string;
}

const serviceablePincodeSchema = new Schema<IServiceablePincode>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    franchise_id: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
  },
  {
    versionKey: false,
  },
);

serviceablePincodeSchema.index({ franchise_id: 1, pincode: 1 }, { unique: true });

const ServiceablePincode = model<IServiceablePincode>(
  "ServiceablePincode",
  serviceablePincodeSchema,
);

export default ServiceablePincode;
