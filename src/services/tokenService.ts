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
  },

  async findTokenByPlain (plainToken: string) {
    const tokens = await prisma.passwordResetToken.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        }
      }
    });

    let matchingToken: typeof tokens[0] | null = null;
    for ( const t of tokens ) {
      if ( await bcrypt.compare(plainToken, t.token) ) {
        matchingToken = t;
        break;
      }
    }

    return matchingToken;
  },

  deleteToken (id: number) {
    return prisma.passwordResetToken.delete({
      where: {
        id
      }
    })
  }
}