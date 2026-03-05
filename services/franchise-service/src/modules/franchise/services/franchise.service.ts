import {
  type FranchiseRecord,
  type ServiceablePincodeRecord,
  franchiseRepository,
} from "../repositories/franchise.repository";

export type CreateFranchisePayload = {
  name: string;
  city: string;
  state: string;
  region: string;
};

export type AddPincodePayload = {
  franchise_id: string;
  pincode: string;
};

type FranchiseServiceResponse = {
  message: string;
  data?: FranchiseRecord | FranchiseRecord[] | ServiceablePincodeRecord | null;
};

class FranchiseService {
  async createFranchise(
    payload: CreateFranchisePayload,
  ): Promise<FranchiseServiceResponse> {
    const createdFranchise = await franchiseRepository.createFranchise(payload);
    return {
      message: "Franchise created successfully",
      data: createdFranchise,
    };
  }

  async getFranchises(): Promise<FranchiseServiceResponse> {
    const franchises = await franchiseRepository.findAllFranchises();
    return {
      message: "Franchises fetched successfully",
      data: franchises,
    };
  }

  async addPincode(payload: AddPincodePayload): Promise<FranchiseServiceResponse> {
    const franchise = await franchiseRepository.findFranchiseById(
      payload.franchise_id,
    );

    if (!franchise) {
      return {
        message: "Franchise not found",
        data: null,
      };
    }

    const pincodeRecord = await franchiseRepository.addPincode(payload);
    return {
      message: "Pincode added successfully",
      data: pincodeRecord,
    };
  }

  async lookupFranchiseByPincode(
    pincode: string,
  ): Promise<FranchiseServiceResponse> {
    const franchise = await franchiseRepository.findFranchiseByPincode(pincode);

    if (!franchise) {
      return {
        message: "Franchise not found for provided pincode",
        data: null,
      };
    }

    return {
      message: "Franchise fetched successfully",
      data: franchise,
    };
  }
}

export const franchiseService = new FranchiseService();
