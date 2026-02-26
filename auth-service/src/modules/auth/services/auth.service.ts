import { authRepository } from "../repositories/auth.repository";
import { generateAccessToken } from "../../../utils/jwt";
import { comparePassword, hashPassword } from "../../../utils/password";

export type AuthPayload = {
  email: string;
  password: string;
};

type AuthResponse = {
  accessToken?: string;
  message?: string;
};

class AuthService {
  async register(payload: AuthPayload): Promise<AuthResponse> {
    const existingUser = await authRepository.findByEmail(payload.email);

    if (existingUser) {
      return { message: "Email already in use" };
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
      return { message: "Invalid credentials" };
    }

    const isPasswordValid = await comparePassword(
      payload.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      return { message: "Invalid credentials" };
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    return { accessToken };
  }
}

export const authService = new AuthService();
