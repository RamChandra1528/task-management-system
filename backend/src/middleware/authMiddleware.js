import jwt from "jsonwebtoken";

import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { User } from "../models/User.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    throw httpError(401, "Authentication required");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "super-secret-taskpro-key");
    const user = await User.findById(payload.sub).populate("workspace team");

    if (!user) {
      throw httpError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    throw httpError(401, "Invalid or expired token");
  }
});

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      next(httpError(401, "Authentication required"));
      return;
    }

    if (roles.length && !roles.includes(req.user.role)) {
      next(httpError(403, "You do not have permission to perform this action"));
      return;
    }

    next();
  };
}
