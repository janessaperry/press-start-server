import { prisma } from "../db/client.js";
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


}