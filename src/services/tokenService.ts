import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { prisma } from "../db/client.js";
import { User } from "../generated/prisma/client"

export const TokenService = {
  async generateToken (user: User) {
    try {
      const rawToken = uuidv4();
      const hashedToken = await bcrypt.hash(rawToken, 10);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes

      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      const record = await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: `${hashedToken}`,
          expiresAt
        },
      })

      return `${record.id}.${rawToken}`;
    }
    catch (e) {
      console.error(`Error generating token: ${e}`);
      throw e;
    }
  },

  async findRecentToken (user: User) {
    const cooldownMs = 60 * 1000;
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - cooldownMs) }
      }
    });

    if (!recentToken) return null;

    const timeElapsed = Date.now() - new Date(recentToken.createdAt).getTime();
    const timeRemainingSeconds = Math.ceil((cooldownMs - timeElapsed) / 1000);
    return { recentToken, timeRemainingSeconds }
  },

  async findTokenByPlain (plainToken: string) {
    const [ idStr, rawToken ] = plainToken.split(".");
    const id = Number(idStr);
    if (!id || !rawToken) return null;

    const record = await prisma.passwordResetToken.findUnique({ where: { id } });
    if (!record) return null;

    const matches = await bcrypt.compare(rawToken, record.token);
    return matches ? record : null;
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