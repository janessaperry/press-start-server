import { prisma } from "../db/client.js";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";

export const UserService = {
  async findByEmail (email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        email
      }
    })
  },

  async createNewUser (email: string, hashedPassword: string) {
    return prisma.user.create({
      data: {
        email,
        hashedPassword,
      }
    });
  },

  // helper for normal password changes
  async hashAndUpdatePassword (userId: number, plainPassword: string) {
    const hashedPassword = await this.hashPassword(plainPassword);
    await this.updatePasswordTx(userId, hashedPassword);
  },

  // re-usable hashing logic
  async hashPassword (plainPassword: string): Promise<string> {
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