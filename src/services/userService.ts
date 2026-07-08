import { prisma } from "../db/client.js";
import { User } from "../generated/prisma/client";

export const UserService = {
  async findByEmail (email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        email
      }
    })
  },

  async findById (id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async createNewUser (email: string, hashedPassword: string) {
    return prisma.user.create({
      data: {
        email,
        hashedPassword,
      }
    });
  },

  async destroyUserById (id: number) {
    return prisma.user.delete({
      where: {id}
    })
  }
}