import { Request, Response } from "express";
import { GameService } from "../services/gameService.js";

interface GameQuery {
  search?: string,
  platform?: string,
  status?: string,
}


type GameDetailsDTO = {
  id: number,
  name: string,
  coverUrl: string,
  releaseDate: string,
  slug: string,
  totalRating: string,
  summary: string,
}

export const index = async (req: Request<any, any, any, GameQuery>, res: Response) => {
  const {search, platform, status} = req.query;

  let searchResults;
  if (search) {
    const select = {
      id: true,
      name: true,
      coverUrl: true
    }
    searchResults = await GameService.findByName(search, select);
  }

  let comingSoon;
  let newRelease;
  if (status) {
    const statusArr = status.split(',');

    if (statusArr.includes('coming-soon')) {
      comingSoon = await GameService.findComingSoonGames();
    }

    if (statusArr.includes('new-release')) {
      newRelease = await GameService.findNewReleaseGames();
    }
  }

  res.status(200).json({
    "message": "request made to /index",
    "searchQuery": search,
    "searchResults": searchResults,
    "platform": platform,
    status: {
      comingSoon,
      newRelease
    },
  })
  return;
}

export const show = async (req: Request, res: Response) => {
  const {gameId} = req.params;
  console.log(gameId);

  res.status(200).json({
    "message": "request made to /show/:gameId"
  })
}