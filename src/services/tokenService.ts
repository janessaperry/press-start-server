import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { prisma } from "../db/client.js";
import { User } from "@prisma/client";

export const TokenService = {
  async generateToken (user: User) {
    try {
      const plainToken = uuidv4();
      const hashedToken = await bcrypt.hash(plainToken, 10);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: `${hashedToken}`,
          expiresAt
        },
      })

      return plainToken;
    }
    catch (e) {
      console.error(`Error generating token: ${e}`);
      throw e;
    }
  },

  async findRecentToken (user: User) {
    const cooldownMs = 60 * 1000;
    return prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - cooldownMs) }
      }
    });
  },

  async findTokenByPlain (plainToken: string) {
    const tokens = await prisma.passwordResetToken.findMany();

    for ( const t of tokens ) {
      if ( await bcrypt.compare(plainToken, t.token) ) {
        return t;
      }
    }
  },

  deleteToken (id: number) {
    return prisma.passwordResetToken.delete({
      where: {
        id
      }
    })
  },

  async cleanupExpiredTokens () {
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    })
    return result.count;
  },


}