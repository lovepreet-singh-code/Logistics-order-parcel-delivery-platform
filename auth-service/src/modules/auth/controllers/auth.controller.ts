import { Request, Response } from "express";
import { authService } from "../services/auth.service";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ message: "email and password are required" });
    return;
  }

  const result = await authService.register({ email, password });

  if (result.message) {
    res.status(409).json({ message: result.message });
    return;
  }

  res.status(201).json(result);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ message: "email and password are required" });
    return;
  }

  const result = await authService.login({ email, password });

  if (result.message) {
    res.status(401).json({ message: result.message });
    return;
  }

  res.status(200).json(result);
};
