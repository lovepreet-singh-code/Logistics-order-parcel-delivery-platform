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
  res.status(501).json(result);
};

export const getFranchises = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const result = await franchiseService.getFranchises();
  res.status(501).json(result);
};

export const addPincode = async (req: Request, res: Response): Promise<void> => {
  const payload = req.body as AddPincodePayload;
  const result = await franchiseService.addPincode(payload);
  res.status(501).json(result);
};

export const lookupFranchiseByPincode = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await franchiseService.lookupFranchiseByPincode(
    req.params.code,
  );
  res.status(501).json(result);
};
