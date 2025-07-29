import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { validateEmail, validatePasswordFormat } from "../utils/validators.js";

import { prisma } from "../db/client.js";
import { ENV } from "../config/env.js";


export const register = async (req: Request, res: Response) => {
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

    const hashedPw = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        hashedPw,
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
    const emailValid = validateEmail(email);
    const passwordFormatValid = validatePasswordFormat(password);
    const formValid = emailValid && passwordFormatValid;

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

    const { hashedPw } = user;
    const passwordMatches = await bcrypt.compare(password, hashedPw);

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
  try {


  }
  catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Internal server error"
    });
    return;
  }
}

export const verifyPasswordResetCode = async (req: Request, res: Response) => {
  try {


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


  }
  catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Internal server error"
    });
    return;
  }
}