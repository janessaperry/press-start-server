import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { prisma } from "../db/client.js";
import { User } from "@prisma/client";

export const TokenService = {
  async generateToken (user: User) {
    try {
      const plainToken = uuidv4();
      const hashedToken = await bcrypt.hash(plainToken, 10);
      const expiresAt = new Date(Date.now() + 3600 * 1000);

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
  }
}