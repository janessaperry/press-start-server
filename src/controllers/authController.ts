import { Request, Response } from "express";

import { prisma } from "../db/client.js";
import { AuthService } from "../services/authService.js";
import { EmailService } from "../services/emailService.js";
import { TokenService } from "../services/tokenService.js";
import { UserService } from "../services/userService.js";

import { validateEmailFormat, validatePasswordFormat } from "../utils/validators.js";


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

    const existingUser = await UserService.findByEmail(email);
    if ( existingUser ) {
      res.status(400).json({
          message: "User with that email address already exists"
        }
      )
      return;
    }

    const hashedPassword = await AuthService.hashPassword(password);
    const newUser = await UserService.createNewUser(email, hashedPassword);

    const token = AuthService.createAuthToken(newUser);

    res.status(201).json({
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

    const user = await UserService.findByEmail(email);

    if ( !user ) {
      res.status(400).json({
        message: "Invalid email or password"
      });
      return;
    }

    const { hashedPassword } = user;
    const passwordMatches = await AuthService.comparePassword(password, hashedPassword);

    if ( !passwordMatches ) {
      res.status(400).json({
        message: "Invalid email or password"
      });
      return;
    }

    const token = AuthService.createAuthToken(user)

    res.status(200).json({
      message: "Sign in successful",
      token,
      userId: user.id
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

    // silent fail
    const user = await UserService.findByEmail(email);
    if ( !user ) {
      res.status(200).json({
        message: "If an account exists, a reset email has been sent."
      });
      return;
    }

    // rate limiting per user email
    const recentToken = await TokenService.findRecentToken(user);
    if ( recentToken ) {
      res.status(429).json({
        message: "Please wait at least 60 seconds before requesting another reset link.",
        retryAfter: recentToken.timeRemainingSeconds
      })
      return;
    }

    // generate token and send email
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

    const { id: tokenId, userId, expiresAt } = matchingToken;
    if ( expiresAt < new Date() ) {
      await TokenService.deleteToken(tokenId);
      res.status(401).json({
        message: "Token has expired. Please request a new password reset."
      });
      return;
    }


    const hashedPassword = await AuthService.hashPassword(newPassword);
    await prisma.$transaction([
      AuthService.updatePasswordTx(userId, hashedPassword),
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
