import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { validateEmailFormat, validatePasswordFormat } from "../utils/validators.js";

import { prisma } from "../db/client.js";
import { ENV } from "../config/env.js";
import { EmailService } from "../services/emailService.js";
import { TokenService } from "../services/tokenService.js";
import { UserService } from "../services/userService.js";


export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const emailFormatValid = validateEmailFormat(email);
    const passwordFormatValid = validatePasswordFormat(password);
    const formValid = emailFormatValid && passwordFormatValid;

    if ( !formValid ) {
      res.status(400).json({
        message: "Invalid form input",
        errors: {
          email: !emailFormatValid ? "Invalid email format" : undefined,
          password: !passwordFormatValid ? "Password does not meet criteria" : undefined,
        }
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      }
    });

    if ( user ) {
      res.status(400).json({
          message: "User with that email address already exists"
        }
      )
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        hashedPassword,
      }
    });

    const token = jwt.sign({ userId: newUser.id }, ENV.JWT_SECRET, {
      expiresIn: "30 days",
    });

    res.status(200).json({
      message: "Sign up successful",
      token,
    });
    return;
  }
  catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Internal server error"
    });
    return;
  }
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const emailFormatValid = validateEmailFormat(email);
    const passwordFormatValid = validatePasswordFormat(password);
    const formValid = emailFormatValid && passwordFormatValid;

    if ( !formValid ) {
      res.status(400).json({
        message: "Invalid email or password"
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      }
    });

    if ( !user ) {
      res.status(400).json({
        message: "Invalid email or password"
      });
      return;
    }

    const { hashedPassword } = user;
    const passwordMatches = await bcrypt.compare(password, hashedPassword);

    if ( !passwordMatches ) {
      res.status(400).json({
        message: "Invalid email or password"
      });
      return;
    }

    const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET, {
      expiresIn: "30 days",
    });

    res.status(200).json({
      message: "Sign in successful",
      token
    });

  }
  catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Internal server error"
    });
    return;
  }
}

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const emailFormatValid = validateEmailFormat(email);
    if ( !emailFormatValid ) {
      res.status(400).json({
        message: "Invalid email"
      });
      return;
    }

    const user = await UserService.findByEmail(email);

    // silent fail
    if ( !user ) {
      res.status(200).json({
        message: "If an account exists, a reset email has been sent."
      });
      return;
    }

    const plainToken = await TokenService.generateToken(user);
    await EmailService.sendPasswordResetEmail(email, plainToken);

    res.status(200).json({
      message: "If an account exists, a reset email has been sent."
    });

  }
  catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Internal server error"
    });
    return;
  }
}


export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { plainToken, newPassword } = req.body;

    const matchingToken = await TokenService.findTokenByPlain(plainToken);
    if ( !matchingToken ) {
      res.status(404).json({
        message: `Invalid token`
      });
      return;
    }

    const { id: tokenId, userId } = matchingToken;
    const hashedPassword = await UserService.hashPassword(newPassword);
    await prisma.$transaction([
      UserService.updatePasswordTx(userId, hashedPassword),
      TokenService.deleteToken(tokenId),
    ]);

    res.status(200).send({ message: "Password reset successful" });
  }
  catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Internal server error"
    });
    return;
  }
}
