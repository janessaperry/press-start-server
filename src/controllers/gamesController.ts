import { Request, Response } from "express";
import { GameDetailsDTO, GameService } from "../services/game/gameService.js";

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
  return;
}

export const show = async (req: Request, res: Response) => {
  const { gameId } = req.params;

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

export const search = async (req: Request<any, any, any, GameQuery>, res: Response) => {
  const { searchQuery } = req.params;

  const searchResults = await GameService.findByName(searchQuery);
  res.status(200).json({
    searchResults
  });
  return;
}