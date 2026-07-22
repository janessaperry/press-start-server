import { Request, Response } from "express";
import { prisma } from "../db/client.js";
import { AppError, RateLimitingError, ValidationError } from "../errors/AppError";
import { EmailService } from "../integrations/emailService.js";
import { AuthService } from "../services/authService.js";
import { TokenService } from "../services/tokenService.js";
import { UserService } from "../services/userService.js";
import { validateEmailFormat, validatePasswordFormat } from "../utils/validators.js";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const emailFormatValid = validateEmailFormat(email);
  const passwordFormatValid = validatePasswordFormat(password);
  const formValid = emailFormatValid && passwordFormatValid;

  if (!formValid) {
    throw new ValidationError("Invalid form input", {
      email: !emailFormatValid ? "Invalid email format" : undefined,
      password: !passwordFormatValid ? "Password does not meet criteria" : undefined,
    })
  }

  const existingUser = await UserService.findByEmail(email);
  if (existingUser) throw new AppError("User with that email address already exists", 409);

  const hashedPassword = await AuthService.hashPassword(password);
  const newUser = await UserService.createNewUser(email, hashedPassword);

  const token = AuthService.createAuthToken(newUser);

  res.status(201).json({
    message: "Sign up successful",
    token,
    userId: newUser.id
  });
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // using the same errors for all cases so we don't leak whether an account exists / what went wrong with login
  const emailFormatValid = validateEmailFormat(email);
  const passwordFormatValid = validatePasswordFormat(password);
  const formValid = emailFormatValid && passwordFormatValid;
  if (!formValid) throw new AppError("Invalid email or password", 400);

  const user = await UserService.findByEmail(email);
  if (!user) throw new AppError("Invalid email or password", 400);

  const { hashedPassword } = user;
  const passwordMatches = await AuthService.comparePassword(password, hashedPassword);
  if (!passwordMatches) throw new AppError("Invalid email or password", 400);

  const token = AuthService.createAuthToken(user)
  res.status(200).json({
    message: "Sign in successful",
    token,
    userId: user.id
  });
}

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  const emailFormatValid = validateEmailFormat(email);
  if (!emailFormatValid) {
    throw new ValidationError("Invalid form input", {
      email: "Invalid email format"
    })
  }

  // silent fail
  const user = await UserService.findByEmail(email);
  if (!user) {
    res.status(200).json({
      message: "If an account exists, a reset email has been sent."
    });
    return;
  }

  // rate limiting per user email
  const recentToken = await TokenService.findRecentToken(user);
  if (recentToken) {
    throw new RateLimitingError("Please wait at least 60 seconds before requesting another reset link.", recentToken.timeRemainingSeconds)
  }

  // generate token and send email
  const plainToken = await TokenService.generateToken(user);
  await EmailService.sendPasswordResetEmail(email, plainToken);

  res.status(200).json({
    message: "If an account exists, a reset email has been sent."
  });
}

export const resetPassword = async (req: Request, res: Response) => {
  const { plainToken, newPassword } = req.body;

  const passwordFormatValid = validatePasswordFormat(newPassword);
  if (!passwordFormatValid) {
    throw new ValidationError("Invalid form input", {
      password: "Password does not meet criteria"
    });
  }

  const matchingToken = await TokenService.findTokenByPlain(plainToken);
  if (!matchingToken) throw new AppError("Invalid token", 400);

  const { id: tokenId, userId, expiresAt } = matchingToken;
  if (expiresAt < new Date()) {
    await TokenService.deleteToken(tokenId);
    throw new AppError( "Token has expired. Please request a new password reset.", 400);
  }

  const hashedPassword = await AuthService.hashPassword(newPassword);
  await prisma.$transaction([
    AuthService.updatePasswordTx(userId, hashedPassword),
    TokenService.deleteToken(tokenId),
  ]);

  res.status(200).send({ message: "Password reset successful" });
}
