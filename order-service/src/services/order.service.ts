import { Types } from "mongoose";
import {
  Order,
  ORDER_STATUSES,
  PARCEL_TYPES,
  type IAddress,
  type IDimensions,
  type IParcelDetails,
  type OrderDocument,
  type OrderStatus,
  type ParcelType,
} from "../models/order.model";
import { AppError } from "../middlewares/error.middleware";

export interface AddressPayload {
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export interface DimensionsPayload {
  length: number;
  width: number;
  height: number;
}

export interface ParcelDetailsPayload {
  weightKg: number;
  dimensions: DimensionsPayload;
  parcelType: ParcelType;
}

export interface CreateOrderPayload {
  customerId: string;
  pickupAddress: AddressPayload;
  deliveryAddress: AddressPayload;
  parcelDetails: ParcelDetailsPayload;
  assignedVehicleId?: string;
  assignedFranchiseId: string;
  status?: OrderStatus;
}

export type UpdateOrderPayload = Partial<CreateOrderPayload>;

export interface OrderFilters {
  status?: OrderStatus;
  customerId?: string;
  assignedFranchiseId?: string;
}

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const isValidOrderStatus = (value: unknown): value is OrderStatus => {
  return typeof value === "string" && ORDER_STATUSES.includes(value as OrderStatus);
};

const isValidParcelType = (value: unknown): value is ParcelType => {
  return typeof value === "string" && PARCEL_TYPES.includes(value as ParcelType);
};

const validateOrderId = (id: string): void => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid order id");
  }
};

const validateAddress = (address: IAddress, fieldName: string): void => {
  if (!isNonEmptyString(address?.name)) {
    throw new AppError(400, `${fieldName}.name is required`);
  }

  if (!isNonEmptyString(address?.phone)) {
    throw new AppError(400, `${fieldName}.phone is required`);
  }

  if (!isNonEmptyString(address?.addressLine)) {
    throw new AppError(400, `${fieldName}.addressLine is required`);
  }

  if (!isNonEmptyString(address?.city)) {
    throw new AppError(400, `${fieldName}.city is required`);
  }

  if (!isNonEmptyString(address?.state)) {
    throw new AppError(400, `${fieldName}.state is required`);
  }

  if (!isNonEmptyString(address?.pincode)) {
    throw new AppError(400, `${fieldName}.pincode is required`);
  }
};

const validateDimensions = (dimensions: IDimensions): void => {
  if (typeof dimensions?.length !== "number" || dimensions.length <= 0) {
    throw new AppError(400, "parcelDetails.dimensions.length must be a positive number");
  }

  if (typeof dimensions?.width !== "number" || dimensions.width <= 0) {
    throw new AppError(400, "parcelDetails.dimensions.width must be a positive number");
  }

  if (typeof dimensions?.height !== "number" || dimensions.height <= 0) {
    throw new AppError(400, "parcelDetails.dimensions.height must be a positive number");
  }
};

const validateParcelDetails = (parcelDetails: IParcelDetails): void => {
  if (typeof parcelDetails?.weightKg !== "number" || parcelDetails.weightKg <= 0) {
    throw new AppError(400, "parcelDetails.weightKg must be a positive number");
  }

  validateDimensions(parcelDetails.dimensions);

  if (!isValidParcelType(parcelDetails.parcelType)) {
    throw new AppError(400, "parcelDetails.parcelType must be DOCUMENT, BOX, FRAGILE, or OTHER");
  }
};

const normalizeAddress = (address: AddressPayload): AddressPayload => {
  return {
    name: address.name.trim(),
    phone: address.phone.trim(),
    addressLine: address.addressLine.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    pincode: address.pincode.trim(),
  };
};

const normalizeCreatePayload = (payload: CreateOrderPayload): CreateOrderPayload => {
  return {
    customerId: payload.customerId.trim(),
    pickupAddress: normalizeAddress(payload.pickupAddress),
    deliveryAddress: normalizeAddress(payload.deliveryAddress),
    parcelDetails: {
      weightKg: payload.parcelDetails.weightKg,
      dimensions: {
        length: payload.parcelDetails.dimensions.length,
        width: payload.parcelDetails.dimensions.width,
        height: payload.parcelDetails.dimensions.height,
      },
      parcelType: payload.parcelDetails.parcelType,
    },
    assignedVehicleId: payload.assignedVehicleId?.trim(),
    assignedFranchiseId: payload.assignedFranchiseId.trim(),
    status: payload.status,
  };
};

const validateCreatePayload = (payload: CreateOrderPayload): void => {
  if (!isNonEmptyString(payload.customerId)) {
    throw new AppError(400, "customerId is required");
  }

  if (!payload.pickupAddress) {
    throw new AppError(400, "pickupAddress is required");
  }

  if (!payload.deliveryAddress) {
    throw new AppError(400, "deliveryAddress is required");
  }

  if (!payload.parcelDetails) {
    throw new AppError(400, "parcelDetails is required");
  }

  validateAddress(payload.pickupAddress, "pickupAddress");
  validateAddress(payload.deliveryAddress, "deliveryAddress");
  validateParcelDetails(payload.parcelDetails);

  if (!isNonEmptyString(payload.assignedFranchiseId)) {
    throw new AppError(400, "assignedFranchiseId is required");
  }

  if (payload.assignedVehicleId !== undefined && !isNonEmptyString(payload.assignedVehicleId)) {
    throw new AppError(400, "assignedVehicleId cannot be empty");
  }

  if (payload.status !== undefined && !isValidOrderStatus(payload.status)) {
    throw new AppError(
      400,
      "status must be CREATED, CONFIRMED, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, or CANCELLED",
    );
  }
};

const validateUpdatePayload = (payload: UpdateOrderPayload): void => {
  if (Object.keys(payload).length === 0) {
    throw new AppError(400, "At least one field is required for update");
  }

  if (payload.customerId !== undefined && !isNonEmptyString(payload.customerId)) {
    throw new AppError(400, "customerId cannot be empty");
  }

  if (payload.pickupAddress !== undefined) {
    validateAddress(payload.pickupAddress, "pickupAddress");
  }

  if (payload.deliveryAddress !== undefined) {
    validateAddress(payload.deliveryAddress, "deliveryAddress");
  }

  if (payload.parcelDetails !== undefined) {
    validateParcelDetails(payload.parcelDetails);
  }

  if (
    payload.assignedFranchiseId !== undefined &&
    !isNonEmptyString(payload.assignedFranchiseId)
  ) {
    throw new AppError(400, "assignedFranchiseId cannot be empty");
  }

  if (payload.assignedVehicleId !== undefined && !isNonEmptyString(payload.assignedVehicleId)) {
    throw new AppError(400, "assignedVehicleId cannot be empty");
  }

  if (payload.status !== undefined && !isValidOrderStatus(payload.status)) {
    throw new AppError(
      400,
      "status must be CREATED, CONFIRMED, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, or CANCELLED",
    );
  }
};

const validateStatus = (status: unknown): status is OrderStatus => {
  if (!isValidOrderStatus(status)) {
    throw new AppError(
      400,
      "status must be CREATED, CONFIRMED, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, or CANCELLED",
    );
  }

  return true;
};

const buildOrderFilters = (filters: OrderFilters): Record<string, unknown> => {
  const query: Record<string, unknown> = { isActive: true };

  if (filters.status !== undefined) {
    validateStatus(filters.status);
    query.status = filters.status;
  }

  if (filters.customerId !== undefined) {
    if (!isNonEmptyString(filters.customerId)) {
      throw new AppError(400, "customerId cannot be empty");
    }

    query.customerId = filters.customerId.trim();
  }

  if (filters.assignedFranchiseId !== undefined) {
    if (!isNonEmptyString(filters.assignedFranchiseId)) {
      throw new AppError(400, "assignedFranchiseId cannot be empty");
    }

    query.assignedFranchiseId = filters.assignedFranchiseId.trim();
  }

  return query;
};

const normalizeUpdatePayload = (payload: UpdateOrderPayload): UpdateOrderPayload => {
  const normalizedPayload: UpdateOrderPayload = { ...payload };

  if (normalizedPayload.customerId !== undefined) {
    normalizedPayload.customerId = normalizedPayload.customerId.trim();
  }

  if (normalizedPayload.pickupAddress !== undefined) {
    normalizedPayload.pickupAddress = normalizeAddress(normalizedPayload.pickupAddress);
  }

  if (normalizedPayload.deliveryAddress !== undefined) {
    normalizedPayload.deliveryAddress = normalizeAddress(normalizedPayload.deliveryAddress);
  }

  if (normalizedPayload.assignedVehicleId !== undefined) {
    normalizedPayload.assignedVehicleId = normalizedPayload.assignedVehicleId.trim();
  }

  if (normalizedPayload.assignedFranchiseId !== undefined) {
    normalizedPayload.assignedFranchiseId = normalizedPayload.assignedFranchiseId.trim();
  }

  return normalizedPayload;
};

export const orderService = {
  createOrder: async (payload: CreateOrderPayload): Promise<OrderDocument> => {
    validateCreatePayload(payload);
    const normalizedPayload = normalizeCreatePayload(payload);

    const order = await Order.create({
      customerId: normalizedPayload.customerId,
      pickupAddress: normalizedPayload.pickupAddress,
      deliveryAddress: normalizedPayload.deliveryAddress,
      parcelDetails: normalizedPayload.parcelDetails,
      assignedVehicleId: normalizedPayload.assignedVehicleId,
      assignedFranchiseId: normalizedPayload.assignedFranchiseId,
      status: normalizedPayload.status ?? "CREATED",
      isActive: true,
    });

    return order;
  },

  getOrders: async (filters: OrderFilters): Promise<OrderDocument[]> => {
    const query = buildOrderFilters(filters);
    const orders = await Order.find(query).sort({ createdAt: -1 }).exec();

    return orders;
  },

  getOrderById: async (id: string): Promise<OrderDocument> => {
    validateOrderId(id);

    const order = await Order.findOne({ _id: id, isActive: true }).exec();

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    return order;
  },

  updateOrder: async (id: string, payload: UpdateOrderPayload): Promise<OrderDocument> => {
    validateOrderId(id);
    validateUpdatePayload(payload);

    const normalizedPayload = normalizeUpdatePayload(payload);

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: normalizedPayload },
      { new: true, runValidators: true },
    ).exec();

    if (!updatedOrder) {
      throw new AppError(404, "Order not found");
    }

    return updatedOrder;
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<OrderDocument> => {
    validateOrderId(id);
    validateStatus(status);

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { status } },
      { new: true, runValidators: true },
    ).exec();

    if (!updatedOrder) {
      throw new AppError(404, "Order not found");
    }

    return updatedOrder;
  },

  assignVehicle: async (id: string, vehicleId: string): Promise<OrderDocument> => {
    validateOrderId(id);

    if (!isNonEmptyString(vehicleId)) {
      throw new AppError(400, "vehicleId is required");
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { assignedVehicleId: vehicleId.trim() } },
      { new: true, runValidators: true },
    ).exec();

    if (!updatedOrder) {
      throw new AppError(404, "Order not found");
    }

    return updatedOrder;
  },

  softDeleteOrder: async (id: string): Promise<void> => {
    validateOrderId(id);

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { isActive: false } },
      { new: true },
    ).exec();

    if (!updatedOrder) {
      throw new AppError(404, "Order not found");
    }
  },
};
