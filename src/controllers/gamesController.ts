import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { GameService } from "../services/game/gameService.js";
import { GameDetailsDTO } from "../services/game/gameService.types";
import { libraryService } from "../services/libraryService.js";

export type GameQuery = {
  search?: string,
  platformFamily?: string,
  platform?: string,
  genres?: string,
  gameType?: string,
  themes?: string,
  franchises?: string,
  timeToBeat?: string,
  totalRating?: string,
  releaseDate?: string,
  status?: string,
  limit?: string,
  offset?: string,
  sorting?: string,
}

export const index = async (req: Request<any, any, any, GameQuery>, res: Response) => {
  const userId: number | undefined = req.user?.userId;
  const {
    search,
    platformFamily, platform,
    genres, gameType, themes, franchises,
    timeToBeat, totalRating, releaseDate,
    status,
    limit, offset, sorting = "createdAt-desc"
  } = req.query;
  const MAX_LIMIT = 100;
  const parsedLimit = Math.min(Number(limit) || 20, MAX_LIMIT);
  const parsedOffset = Math.max(Number(offset) || 0, 0);
  const [ sortCategory, sortOrder ] = sorting.split('-');

  const filters = {
    search,
    platformFamily, platform,
    genres, gameType, themes, franchises,
    timeToBeat, totalRating, releaseDate,
    parsedLimit, parsedOffset, sortCategory, sortOrder,
  }
  const filteredResults = await GameService.findAll(filters, userId);

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
    filteredResults,
    status: {
      comingSoon,
      newRelease
    },
  })
}

export const show = async (req: Request, res: Response) => {
  const gameId = Number(req.params.gameId);
  if (isNaN(gameId) || gameId < 1) throw new AppError("Invalid game id", 400);

  const gameDetails: GameDetailsDTO | null = await GameService.getGameDetails(gameId);
  if (!gameDetails) return res.status(404).json({ message: "Game not found" });

  const userId: number | undefined = req.user?.userId;
  const libraryData = userId ? await libraryService.findById(userId, gameId) : undefined;

  res.status(200).json({
    gameDetails,
    libraryData
  });
}

export const search = async (req: Request<any, any, any, string>, res: Response) => {
  const { searchQuery } = req.params;
  if (!searchQuery) throw new AppError("Search query is required", 400);

  const searchResults = await GameService.findByName(searchQuery);
  res.status(200).json({
    searchResults
  });
}