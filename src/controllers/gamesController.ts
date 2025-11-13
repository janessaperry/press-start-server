import { Request, Response } from "express";

interface GameQuery {
  search?: string,
  platform?: string,
  status?: string,
}

export const index = async (req: Request<any, any, any, GameQuery>, res: Response) => {
  const { search, platform, status } = req.query;
  
  res.status(200).json({
    "message": "request made to /index",
    "searchQuery": search,
    "platform": platform,
    "status": status,
  })
  return;
}

export const show = async (req: Request, res: Response) => {
  const { gameId } = req.params;
  console.log(gameId);

  res.status(200).json({
    "message": "request made to /show/:gameId"
  })
}