import jwt from "jsonwebtoken";
import { ERROR_CODES, generateError } from "./error.utils";

export function decodeToken(tokenHeader: string): { _id?: string } {
  try {
    const bearerToken = tokenHeader?.replace("Bearer ", "");
    return jwt.decode(bearerToken) as { _id?: string };
  } catch (error) {
    throw generateError(ERROR_CODES.UNAUTHORIZED, "Invalid Token");
  }
}
