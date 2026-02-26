import { randomUUID } from "crypto";
import AuthUser from "../models/authUser.model";

export type AuthUserRecord = {
  id: string;
  email: string;
  password_hash: string;
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
}

export const authRepository = new AuthRepository();
