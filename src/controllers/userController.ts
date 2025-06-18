import { Request, Response } from "express";

export const signUp = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      message: "sign up successful",
      token: "test-token-signup"
    });
  }
  catch (e) {
    console.error(e);
  }
}

export const logIn = (req: Request, res: Response) => {
  res.status(200).json({
    message: "log in successful",
    token: "test-token-login"
  });
}
