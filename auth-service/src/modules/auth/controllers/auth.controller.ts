import { Request, Response } from "express";
import { authService } from "../services/auth.service";

type EmailPasswordBody = {
  email?: string;
  password?: string;
};

type RefreshTokenBody = {
  refreshToken?: string;
};

type ForgotPasswordBody = {
  email?: string;
};

type ResetPasswordBody = {
  resetToken?: string;
  newPassword?: string;
};

type LogoutBody = {
  token?: string;
};

const extractBearerToken = (authorizationHeader?: string): string | undefined => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return undefined;
  }

  const token = authorizationHeader.slice(7).trim();
  return token || undefined;
};

const isTokenErrorMessage = (message?: string): boolean => {
  return message === "Invalid token" || message === "Token expired";
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as EmailPasswordBody;

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
  const { email, password } = req.body as EmailPasswordBody;

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

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { refreshToken: token } = req.body as RefreshTokenBody;

  if (!token) {
    res.status(400).json({ message: "refreshToken is required" });
    return;
  }

  const result = await authService.refreshToken(token);

  if (result.message) {
    if (result.message === "Token configuration missing") {
      res.status(500).json({ message: result.message });
      return;
    }

    res.status(401).json({ message: result.message });
    return;
  }

  res.status(200).json(result);
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = req.body as ForgotPasswordBody;

  if (!email) {
    res.status(400).json({ message: "email is required" });
    return;
  }

  const result = await authService.forgotPassword(email);
  res.status(200).json(result);
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { resetToken, newPassword } = req.body as ResetPasswordBody;

  if (!resetToken || !newPassword) {
    res.status(400).json({ message: "resetToken and newPassword are required" });
    return;
  }

  const result = await authService.resetPassword(resetToken, newPassword);

  if (result.message === "User not found") {
    res.status(404).json({ message: result.message });
    return;
  }

  if (isTokenErrorMessage(result.message)) {
    res.status(401).json({ message: result.message });
    return;
  }

  if (result.message !== "Password reset successful") {
    res.status(400).json({ message: result.message });
    return;
  }

  res.status(200).json(result);
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const headerToken = extractBearerToken(req.headers.authorization);
  const { token: bodyToken } = req.body as LogoutBody;
  const token = headerToken || bodyToken;

  if (!token) {
    res.status(400).json({ message: "token is required" });
    return;
  }

  const result = await authService.logout(token);

  if (result.message === "Token configuration missing") {
    res.status(500).json({ message: result.message });
    return;
  }

  if (result.message !== "Logged out successfully") {
    res.status(401).json({ message: result.message });
    return;
  }

  res.status(200).json(result);
};
