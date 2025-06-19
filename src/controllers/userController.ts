import { Request, Response } from "express";
import { validateEmail, validatePasswordFormat } from "../utils/validators.js";
import { prisma } from "../db/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const signUp = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const emailValid = validateEmail(email);
    const passwordFormatValid = validatePasswordFormat(password);
    const formValid = emailValid && passwordFormatValid;

    if ( !formValid ) {
      res.status(400).json({
        message: "Invalid form input",
        errors: {
          email: !emailValid ? "Invalid email format" : undefined,
          password: !passwordFormatValid ? "Password does not meet criteria" : undefined,
        }
      });
      return;
    }

    const userExists = await prisma.user.findUnique({
      where: {
        email: email,
      }
    })

    if ( !!userExists ) {
      res.status(400).json({
          message: "email already exists"
        }
      )
      return;
    }

    const hashedPw = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        hashedPw,
      }
    });

    const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET, {
      expiresIn: "30 days",
    });

    res.status(200).json({
      message: "sign up successful",
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

export const logIn = (req: Request, res: Response) => {
  res.status(200).json({
    message: "log in successful",
    token: "test-token-login"
  });
  return;
}
