import { randomUUID } from "crypto";
import AuthUser from "../models/authUser.model";
import PasswordResetToken from "../models/passwordResetToken.model";
import RevokedToken from "../models/revokedToken.model";

export type AuthUserRecord = {
  id: string;
  email: string;
  password_hash: string;
};

export type PasswordResetTokenRecord = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  used: boolean;
};

class AuthRepository {
  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    const user = await AuthUser.findOne({ email })
      .select({ id: 1, email: 1, password: 1 })
      .lean();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      password_hash: user.password,
    };
  }

  async findByEmailForLogin(email: string): Promise<AuthUserRecord | null> {
    const user = await AuthUser.findOne({ email })
      .select({ id: 1, email: 1, password: 1 })
      .lean();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      password_hash: user.password,
    };
  }

  async createUser(
    email: string,
    passwordHash: string,
  ): Promise<AuthUserRecord> {
    const usernameFromEmail = email.split("@")[0] || "user";

    const createdUser = await AuthUser.create({
      id: randomUUID(),
      name: usernameFromEmail,
      email,
      phone: `pending-${Date.now()}`,
      password: passwordHash,
      role: "user",
    });

    return {
      id: createdUser.id,
      email: createdUser.email,
      password_hash: createdUser.password,
    };
  }

  async savePasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await PasswordResetToken.deleteMany({ userId, used: false });

    await PasswordResetToken.create({
      userId,
      tokenHash,
      expiresAt,
      used: false,
    });
  }

  async findActivePasswordResetToken(
    tokenHash: string,
  ): Promise<PasswordResetTokenRecord | null> {
    const token = await PasswordResetToken.findOne({ tokenHash, used: false })
      .select({ userId: 1, tokenHash: 1, expiresAt: 1, used: 1 })
      .lean();

    if (!token) {
      return null;
    }

    return {
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      used: token.used,
    };
  }

  async updatePasswordByUserId(
    userId: string,
    passwordHash: string,
  ): Promise<boolean> {
    const result = await AuthUser.updateOne(
      { id: userId },
      { $set: { password: passwordHash } },
    );

    return result.matchedCount > 0;
  }

  async markPasswordResetTokenUsed(tokenHash: string): Promise<void> {
    await PasswordResetToken.updateOne(
      { tokenHash, used: false },
      { $set: { used: true } },
    );
  }

  async saveRevokedToken(tokenHash: string, expiresAt: Date): Promise<void> {
    await RevokedToken.updateOne(
      { tokenHash },
      { $set: { tokenHash, expiresAt } },
      { upsert: true },
    );
  }
}

export const authRepository = new AuthRepository();
