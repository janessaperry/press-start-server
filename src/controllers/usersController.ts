import { Request, Response } from "express";
import { AuthService } from "../services/authService.js";
import { UserService } from "../services/userService.js";
import { validatePasswordFormat } from "../utils/validators.js";

export const updatePassword = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await UserService.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const currentPasswordMatches = await AuthService.comparePassword(currentPassword, user.hashedPassword);
    if (!currentPasswordMatches) {
      res.status(401).json({ message: "Current password is incorrect" });
      return;
    }

    if (!validatePasswordFormat(newPassword)) {
      res.status(400).json({ message: "New password does not meet criteria" });
      return;
    }

    await AuthService.hashAndUpdatePassword(userId, newPassword);

    res.status(200).json({ message: "Password updated successfully" });
  }
  catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const destroy = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }

  try {
    const foundUser = await UserService.findById(userId);
    if (!foundUser) {
      res.status(404).json({ message: `User ${userId} not found.`});
      return;
    }

    await UserService.destroyUserById(userId);
    res.status(204).send();
  }
  catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
}