import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { User } from "@prisma/client";

export const AuthService = {
  createAuthToken (newUser: User) {
    return jwt.sign({ userId: newUser.id }, ENV.JWT_SECRET, {
      expiresIn: "30 days",
    });
  },


}