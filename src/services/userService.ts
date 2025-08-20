import { prisma } from "../db/client.js";
import bcrypt from "bcrypt";

export const UserService = {
  //  helper for normal password changes
  async hashAndUpdatePassword (userId: number, plainPw: string) {
    const hashedPw = await this.hashPassword(plainPw);
    await this.updatePasswordTx(userId, hashedPw);
  },

  // re-usable hashing logic
  async hashPassword (plainPw: string) {
    return await bcrypt.hash(plainPw, 10);
  },
  
  // db update; used in transactions
  updatePasswordTx (userId: number, hashedPw: string) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedPw
      }
    });
  }
}