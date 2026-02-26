import { createHash, randomBytes } from "crypto";
import jwt, { TokenExpiredError, type JwtPayload } from "jsonwebtoken";
import { authRepository } from "../repositories/auth.repository";
import { generateAccessToken } from "../../../utils/jwt";
import { comparePassword, hashPassword } from "../../../utils/password";

export type AuthPayload = {
  email: string;
  password: string;
};

type AuthResponse = {
  accessToken?: string;
  resetToken?: string;
  message?: string;
};

type JwtTokenPayload = JwtPayload & {
  userId?: string;
  email?: string;
  exp?: number;
};

const AUTH_MESSAGES = {
  emailInUse: "Email already in use",
  invalidCredentials: "Invalid credentials",
  tokenConfigMissing: "Token configuration missing",
  invalidToken: "Invalid token",
  tokenExpired: "Token expired",
  forgotPasswordGeneric: "If the account exists, a reset token has been generated",
  userNotFound: "User not found",
  passwordResetSuccess: "Password reset successful",
  logoutSuccess: "Logged out successfully",
};

const isRefreshPayload = (
  decoded: JwtPayload | string,
): decoded is JwtTokenPayload => {
  return (
    typeof decoded !== "string" &&
    typeof decoded.userId === "string" &&
    typeof decoded.email === "string"
  );
};

class AuthService {
  async register(payload: AuthPayload): Promise<AuthResponse> {
    const existingUser = await authRepository.findByEmail(payload.email);

    if (existingUser) {
      return { message: AUTH_MESSAGES.emailInUse };
    }

    const passwordHash = await hashPassword(payload.password);
    const createdUser = await authRepository.createUser(
      payload.email,
      passwordHash,
    );

    const accessToken = generateAccessToken({
      userId: createdUser.id,
      email: createdUser.email,
    });

    return { accessToken };
  }

  async login(payload: AuthPayload): Promise<AuthResponse> {
    const user = await authRepository.findByEmailForLogin(payload.email);

    if (!user) {
      return { message: AUTH_MESSAGES.invalidCredentials };
    }

    const isPasswordValid = await comparePassword(
      payload.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      return { message: AUTH_MESSAGES.invalidCredentials };
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    return { accessToken };
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      const refreshSecret =
        process.env.REFRESH_JWT_SECRET || process.env.JWT_SECRET;

      if (!refreshSecret) {
        return { message: AUTH_MESSAGES.tokenConfigMissing };
      }

      const decoded = jwt.verify(token, refreshSecret) as JwtPayload | string;

      if (!isRefreshPayload(decoded)) {
        return { message: AUTH_MESSAGES.invalidToken };
      }

      const accessToken = generateAccessToken({
        userId: decoded.userId,
        email: decoded.email,
      });

      return { accessToken };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return { message: AUTH_MESSAGES.tokenExpired };
      }

      return { message: AUTH_MESSAGES.invalidToken };
    }
  }

  async forgotPassword(email: string): Promise<AuthResponse> {
    const genericMessage = AUTH_MESSAGES.forgotPasswordGeneric;
    const user = await authRepository.findByEmail(email);

    if (!user) {
      return { message: genericMessage };
    }

    const resetToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(resetToken).digest("hex");
    const expiresInMinutes =
      Number(process.env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES) || 15;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await authRepository.savePasswordResetToken(user.id, tokenHash, expiresAt);

    if (process.env.NODE_ENV === "production") {
      return { message: genericMessage };
    }

    return { message: genericMessage, resetToken };
  }

  async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<AuthResponse> {
    const tokenHash = createHash("sha256").update(resetToken).digest("hex");
    const tokenRecord = await authRepository.findActivePasswordResetToken(tokenHash);

    if (!tokenRecord) {
      return { message: AUTH_MESSAGES.invalidToken };
    }

    if (tokenRecord.expiresAt.getTime() < Date.now()) {
      return { message: AUTH_MESSAGES.tokenExpired };
    }

    const passwordHash = await hashPassword(newPassword);
    const isUpdated = await authRepository.updatePasswordByUserId(
      tokenRecord.userId,
      passwordHash,
    );

    if (!isUpdated) {
      return { message: AUTH_MESSAGES.userNotFound };
    }

    await authRepository.markPasswordResetTokenUsed(tokenHash);

    return { message: AUTH_MESSAGES.passwordResetSuccess };
  }

  async logout(token: string): Promise<AuthResponse> {
    try {
      const secret = process.env.JWT_SECRET;

      if (!secret) {
        return { message: AUTH_MESSAGES.tokenConfigMissing };
      }

      const decoded = jwt.verify(token, secret) as JwtPayload | string;

      if (typeof decoded === "string") {
        return { message: AUTH_MESSAGES.invalidToken };
      }

      const expiresAt = decoded.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 60 * 60 * 1000);
      const tokenHash = createHash("sha256").update(token).digest("hex");

      await authRepository.saveRevokedToken(tokenHash, expiresAt);

      return { message: AUTH_MESSAGES.logoutSuccess };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return { message: AUTH_MESSAGES.tokenExpired };
      }

      return { message: AUTH_MESSAGES.invalidToken };
    }
  }
}

export const authService = new AuthService();
