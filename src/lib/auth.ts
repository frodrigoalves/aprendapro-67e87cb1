import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET ?? "fallback_secret";
const COOKIE = "aprendapro_token";

export const hashPassword = (p: string) => bcrypt.hash(p, 12);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

export const signToken = (userId: string) =>
  jwt.sign({ userId }, SECRET, { expiresIn: "7d" });

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, SECRET) as { userId: string };
  } catch {
    return null;
  }
};

export const COOKIE_NAME = COOKIE;
