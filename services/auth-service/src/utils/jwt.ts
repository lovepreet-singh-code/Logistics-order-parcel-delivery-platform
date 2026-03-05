import jwt, { type SignOptions } from "jsonwebtoken";

type JwtPayload = {
  userId: string;
  email: string;
};

export const generateAccessToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const expiresIn =
    (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"] | undefined) ??
    "1h";

  return jwt.sign(payload, secret, { expiresIn });
};
