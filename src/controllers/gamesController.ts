import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { GameService } from "../services/game/gameService.js";
import { GameDetailsDTO } from "../services/game/gameService.types";

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
  esrbRating?: string,
  status?: string,
  limit?: string,
  offset?: string,
  sorting?: string,
}

export const index = async (req: Request<any, any, any, GameQuery>, res: Response) => {
  const {
    search,
    platformFamily, platform,
    genres, gameType, themes, franchises,
    timeToBeat, totalRating, releaseDate, esrbRating,
    status,
    limit, offset, sorting = "createdAt-desc"
  } = req.query;
  const parsedLimit = Number(limit) || 20;
  const parsedOffset = Number(offset) || 0;

  //todo what happens with broken sorting string? or an invalid string? e.g., date-added
  const [ sortCategory, sortOrder ] = sorting.split('-');

  const filters = {
    search,
    platformFamily,
    platform,
    genres,
    gameType,
    themes,
    franchises,
    timeToBeat,
    totalRating,
    releaseDate,
    esrbRating,
    parsedLimit,
    parsedOffset,
    sortCategory,
    sortOrder,
  }
  const filteredResults = await GameService.findAll(filters);

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
  if (isNaN(gameId)) throw new AppError("Invalid game id", 400);

  const gameDetails: GameDetailsDTO | null = await GameService.getGameDetails(gameId);
  if (!gameDetails) throw new AppError("Game not found", 404);

  res.status(200).json({
    gameDetails
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