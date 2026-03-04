import { Request, Response } from "express";
import { GameDetailsDTO, GameService } from "../services/game/gameService.js";

type GameQuery = {
  search?: string,
  console?: string,
  status?: string,
}

export const index = async (req: Request<any, any, any, GameQuery>, res: Response) => {
  const {search, console, status} = req.query;

  let searchResults;
  if (search) {
    const select = {
      id: true,
      name: true,
      coverId: true,
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
    "console": console,
    status: {
      comingSoon,
      newRelease
    },
  })
  return;
}

export const show = async (req: Request, res: Response) => {
  const {gameId} = req.params;

  const gameDetails: GameDetailsDTO | null = await GameService.getGameDetails(Number(gameId));
  if (!gameDetails) {
    res.status(404).json({
      message: `game not found`
    })
    return;
  }

  res.status(200).json({
    gameDetails
  });
  return;
}