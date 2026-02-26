import { Request, Response } from "express";
import {
  type AssignAreaPayload,
  type UpdateUserPayload,
  userService,
} from "../services/user.service";

export const getUserById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await userService.getUserById(req.params.id);
  res.status(501).json(result);
};

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  const result = await userService.getUsers();
  res.status(501).json(result);
};

export const assignArea = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const payload = req.body as AssignAreaPayload;
  const result = await userService.assignArea(payload);
  res.status(501).json(result);
};

export const updateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const payload = req.body as UpdateUserPayload;
  const result = await userService.updateUser(req.params.id, payload);
  res.status(501).json(result);
};

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await userService.deleteUser(req.params.id);
  res.status(501).json(result);
};
