import jwt from "jsonwebtoken";

export function generateToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET || "super-secret-taskpro-key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}
