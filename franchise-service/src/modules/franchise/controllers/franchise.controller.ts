import { Request, Response } from "express";
import {
  type AddPincodePayload,
  type CreateFranchisePayload,
  franchiseService,
} from "../services/franchise.service";

export const createFranchise = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const payload = req.body as CreateFranchisePayload;
  const result = await franchiseService.createFranchise(payload);
  res.status(201).json(result);
};

export const getFranchises = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const result = await franchiseService.getFranchises();
  res.status(200).json(result);
};

export const addPincode = async (req: Request, res: Response): Promise<void> => {
  const payload = req.body as AddPincodePayload;
  const result = await franchiseService.addPincode(payload);
  if (result.message === "Franchise not found") {
    res.status(404).json(result);
    return;
  }

  res.status(200).json(result);
};

export const lookupFranchiseByPincode = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await franchiseService.lookupFranchiseByPincode(
    req.params.code,
  );
  if (result.message === "Franchise not found for provided pincode") {
    res.status(404).json(result);
    return;
  }

  res.status(200).json(result);
};
