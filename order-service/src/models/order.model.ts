import {
  type HydratedDocument,
  type Model,
  Schema,
  model,
} from "mongoose";

export const PARCEL_TYPES = ["DOCUMENT", "BOX", "FRAGILE", "OTHER"] as const;
export const ORDER_STATUSES = [
  "CREATED",
  "CONFIRMED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

export type ParcelType = (typeof PARCEL_TYPES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface IAddress {
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IDimensions {
  length: number;
  width: number;
  height: number;
}

export interface IParcelDetails {
  weightKg: number;
  dimensions: IDimensions;
  parcelType: ParcelType;
}

export interface IOrder {
  orderNumber: string;
  customerId: string;
  pickupAddress: IAddress;
  deliveryAddress: IAddress;
  parcelDetails: IParcelDetails;
  assignedVehicleId?: string;
  assignedFranchiseId: string;
  status: OrderStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDocument = HydratedDocument<IOrder>;

type OrderModel = Model<IOrder>;

const addressSchema = new Schema<IAddress>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const dimensionsSchema = new Schema<IDimensions>(
  {
    length: { type: Number, required: true, min: 0.01 },
    width: { type: Number, required: true, min: 0.01 },
    height: { type: Number, required: true, min: 0.01 },
  },
  { _id: false },
);

const parcelDetailsSchema = new Schema<IParcelDetails>(
  {
    weightKg: { type: Number, required: true, min: 0.01 },
    dimensions: { type: dimensionsSchema, required: true },
    parcelType: { type: String, required: true, enum: PARCEL_TYPES },
  },
  { _id: false },
);

const generateOrderNumberCandidate = (): string => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `ORD-${year}${month}${day}-${timestamp}${random}`;
};

const orderSchema = new Schema<IOrder, OrderModel>(
  {
    orderNumber: {
      type: String,
      unique: true,
      immutable: true,
      trim: true,
    },
    customerId: {
      type: String,
      required: true,
      trim: true,
    },
    pickupAddress: {
      type: addressSchema,
      required: true,
    },
    deliveryAddress: {
      type: addressSchema,
      required: true,
    },
    parcelDetails: {
      type: parcelDetailsSchema,
      required: true,
    },
    assignedVehicleId: {
      type: String,
      required: false,
      trim: true,
    },
    assignedFranchiseId: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ORDER_STATUSES,
      default: "CREATED",
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

orderSchema.pre("save", async function () {
  const orderDoc = this as OrderDocument;

  if (orderDoc.orderNumber) {
    return;
  }

  const orderModel = orderDoc.constructor as OrderModel;
  let generatedOrderNumber = generateOrderNumberCandidate();

  while (await orderModel.exists({ orderNumber: generatedOrderNumber })) {
    generatedOrderNumber = generateOrderNumberCandidate();
  }

  orderDoc.orderNumber = generatedOrderNumber;
});

orderSchema.index({ status: 1, customerId: 1, assignedFranchiseId: 1 });

export const Order = model<IOrder, OrderModel>("Order", orderSchema);
