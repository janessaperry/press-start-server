import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { prisma } from "../db/client.js";
import { User } from "../generated/prisma/client";

export const AuthService = {
  createAuthToken (user: User) {
    return jwt.sign({userId: user.id}, ENV.JWT_SECRET, {
      expiresIn: "30 days",
    });
  },

  async comparePassword (password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword)
  },

  async hashAndUpdatePassword (userId: number, plainPassword: string) {
    const hashedPassword = await this.hashPassword(plainPassword);
    await this.updatePasswordTx(userId, hashedPassword);
  },

  async hashPassword (plainPassword: string) {
    return await bcrypt.hash(plainPassword, 10);
  },

  // db update; used in transactions
  updatePasswordTx (userId: number, hashedPassword: string) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedPassword
      }
    });
  }
}