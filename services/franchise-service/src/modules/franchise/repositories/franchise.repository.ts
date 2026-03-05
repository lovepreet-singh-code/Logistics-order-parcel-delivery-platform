import { randomUUID } from "crypto";
import Franchise from "../models/franchise.model";
import ServiceablePincode from "../models/serviceablePincode.model";

export type FranchiseRecord = {
  id: string;
  name: string;
  city: string;
  state: string;
  region: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ServiceablePincodeRecord = {
  id: string;
  franchise_id: string;
  pincode: string;
};

type CreateFranchisePayload = {
  name: string;
  city: string;
  state: string;
  region: string;
};

type AddPincodePayload = {
  franchise_id: string;
  pincode: string;
};

const mapFranchiseRecord = (franchise: {
  id: string;
  name: string;
  city: string;
  state: string;
  region: string;
  createdAt: Date;
  updatedAt: Date;
}): FranchiseRecord => {
  return {
    id: franchise.id,
    name: franchise.name,
    city: franchise.city,
    state: franchise.state,
    region: franchise.region,
    createdAt: franchise.createdAt,
    updatedAt: franchise.updatedAt,
  };
};

const mapPincodeRecord = (record: {
  id: string;
  franchise_id: string;
  pincode: string;
}): ServiceablePincodeRecord => {
  return {
    id: record.id,
    franchise_id: record.franchise_id,
    pincode: record.pincode,
  };
};

class FranchiseRepository {
  async createFranchise(
    payload: CreateFranchisePayload,
  ): Promise<FranchiseRecord> {
    const franchise = await Franchise.create({
      id: randomUUID(),
      name: payload.name,
      city: payload.city,
      state: payload.state,
      region: payload.region,
    });

    return mapFranchiseRecord({
      id: franchise.id,
      name: franchise.name,
      city: franchise.city,
      state: franchise.state,
      region: franchise.region,
      createdAt: franchise.createdAt,
      updatedAt: franchise.updatedAt,
    });
  }

  async findAllFranchises(): Promise<FranchiseRecord[]> {
    const franchises = await Franchise.find()
      .select({
        id: 1,
        name: 1,
        city: 1,
        state: 1,
        region: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .sort({ createdAt: -1 })
      .lean();

    return franchises.map((franchise) => mapFranchiseRecord(franchise));
  }

  async findFranchiseById(id: string): Promise<FranchiseRecord | null> {
    const franchise = await Franchise.findOne({ id })
      .select({
        id: 1,
        name: 1,
        city: 1,
        state: 1,
        region: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .lean();

    if (!franchise) {
      return null;
    }

    return mapFranchiseRecord(franchise);
  }

  async addPincode(payload: AddPincodePayload): Promise<ServiceablePincodeRecord> {
    const record = await ServiceablePincode.create({
      id: randomUUID(),
      franchise_id: payload.franchise_id,
      pincode: payload.pincode,
    });

    return mapPincodeRecord({
      id: record.id,
      franchise_id: record.franchise_id,
      pincode: record.pincode,
    });
  }

  async findFranchiseByPincode(pincode: string): Promise<FranchiseRecord | null> {
    const pincodeRecord = await ServiceablePincode.findOne({ pincode })
      .select({ franchise_id: 1 })
      .lean();

    if (!pincodeRecord) {
      return null;
    }

    return this.findFranchiseById(pincodeRecord.franchise_id);
  }
}

export const franchiseRepository = new FranchiseRepository();
