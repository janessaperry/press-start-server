import { Request, Response } from "express";
import { AppError, ValidationError } from "../errors/AppError";
import { EmailService } from "../integrations/emailService";
import { AuthService } from "../services/authService.js";
import { UserService } from "../services/userService.js";
import { validatePasswordFormat } from "../utils/validators.js";

// authenticated flow: logged-in user changing password
export const updatePassword = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) throw new AppError("Invalid user id", 400);
  if (userId !== req.user?.userId) throw new AppError("Forbidden", 403);

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new AppError("Current and new password are required", 400);
  }

  const user = await UserService.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const currentPasswordMatches = await AuthService.comparePassword(currentPassword, user.hashedPassword);
  if (!currentPasswordMatches) throw new AppError("Current password is incorrect", 400);

  if (!validatePasswordFormat(newPassword)) {
    throw new ValidationError("Invalid form data", {
      newPassword: "New password does not meet criteria"
    })
  }

  await AuthService.hashAndUpdatePassword(userId, newPassword);
  await EmailService.sendPasswordUpdatedEmail(user.email);

  res.status(200).json({ message: "Password updated successfully" });
};

export const destroy = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) throw new AppError("Invalid user id", 400);
  if (userId !== req.user?.userId) throw new AppError("Forbidden", 403);

  const foundUser = await UserService.findById(userId);
  if (!foundUser) throw new AppError("User not found", 404);

  await UserService.destroyUserById(userId);
  res.status(204).send();
}