import { Request, Response } from "express";
import { LIBRARY_FORMAT_FILTERS, LIBRARY_STATUS_FILTERS } from "../constants/filters";
import { prisma } from "../db/client.js";
import { AppError } from "../errors/AppError";
import { Prisma } from "../generated/prisma/client";
import { LibraryStatus } from "../generated/prisma/enums.js";
import { LibraryGameFilters, libraryService } from "../services/libraryService";

// this is the request body!
type CreateLibraryBody = {
  gameId: number;
  libraryPlatform?: { id: number, label: string };
  libraryFormat?: { id: number, label: string };
  libraryStatus?: { id: number, label: string };
};

type LibraryGameQuery = {
  libraryStatus?: string;
  libraryFormat?: string;
  gameType?: string;
  platform?: string;
  releaseDate?: string;
  totalRating?: string;
  genres?: string;
  timeToBeat?: string;
  limit?: string;
  offset?: string;
  sorting?: string;
}

export const index = async (req: Request<any, any, any, LibraryGameQuery>, res: Response) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) throw new AppError("Invalid user id", 400);

  const {
    libraryStatus, libraryFormat,
    gameType, platform, releaseDate, totalRating, genres, timeToBeat,
    limit, offset, sorting = "createdAt-desc"
  } = req.query;

  const parsedLimit = Number(limit) || 20;
  const parsedOffset = Number(offset) || 0;
  const [ sortCategory, sortOrder ] = sorting.split('-');

  const filters: LibraryGameFilters = {
    libraryStatus, libraryFormat,
    gameType, platform, releaseDate, totalRating, genres, timeToBeat,
    parsedLimit, parsedOffset, sortCategory, sortOrder
  };

  const library = await libraryService.findAll(userId, filters);
  // using id '2' (status: playing -> see enums.ts in generated prisma client) to work with logic inside libraryService
  const currentlyPlaying = await libraryService.findAll(userId, { libraryStatus: '2' });
  const libraryCounts = await libraryService.getCounts(userId);

  res.status(200).json({
    library: library.games,
    filteredCount: library.filteredCount,
    currentlyPlaying: currentlyPlaying.games,
    libraryStatusCounts: libraryCounts,
    libraryTotalCount: libraryCounts.reduce((sum, current) => sum + current.count, 0)
  });
};

export const show = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const igdbGameId = Number(req.params.gameId);
  if (isNaN(userId) || isNaN(igdbGameId)) throw new AppError("Invalid user id or game id", 400);

  const foundGame = await libraryService.findById(userId, igdbGameId);
  if (!foundGame) throw new AppError("Game not found", 404);

  res.status(200).json({
    message: "Game details from user's library",
    libraryPlatform: foundGame.libraryPlatform ? {
      id: foundGame.libraryPlatform.id,
      label: foundGame.libraryPlatform.abbreviation
    } : undefined,
    libraryFormat: foundGame.libraryFormat ? LIBRARY_FORMAT_FILTERS.find(item => foundGame.libraryFormat === item.enum) : undefined,
    libraryStatus: foundGame.libraryStatus ? LIBRARY_STATUS_FILTERS.find(item => foundGame.libraryStatus === item.enum) : undefined,
  })
}

export const create = async (req: Request<any, any, CreateLibraryBody>, res: Response) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) throw new AppError("Invalid user id", 400);

  const igdbGameId = Number(req.body.gameId);
  if (isNaN(igdbGameId)) throw new AppError("Invalid game id", 400);

  const rawLibraryPlatform = req.body.libraryPlatform;
  let libraryPlatformId = rawLibraryPlatform && rawLibraryPlatform.id !== 0 ? rawLibraryPlatform.id : null;
  const validPlatform = libraryPlatformId && await prisma.platform.findUnique({
    where: { id: libraryPlatformId }
  });
  // set invalid platform to null since it's optional anyway. this is really only for direct api requests.
  if (!validPlatform) libraryPlatformId = null;

  const rawLibraryFormat = req.body.libraryFormat;
  const libraryFormat = LIBRARY_FORMAT_FILTERS.find(filter => filter.id === rawLibraryFormat?.id)?.enum ?? null;

  const rawLibraryStatus = req.body.libraryStatus;
  const libraryStatus = LIBRARY_STATUS_FILTERS.find(filter => filter.id === rawLibraryStatus?.id)?.enum ?? LibraryStatus.WANT_TO_PLAY;

  const existing = await prisma.userGame.findFirst({ where: { userId, igdbGameId } });
  if (existing) throw new AppError("Game already in library", 409);

  const userGame = await prisma.userGame.create({
    data: {
      userId,
      igdbGameId,
      libraryPlatformId,
      libraryFormat,
      libraryStatus
    },
  });

  res.status(201).json({ userGame });
};

export const update = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const igdbGameId = Number(req.params.gameId);
  if (isNaN(userId) || isNaN(igdbGameId)) throw new AppError("Invalid user id or game id", 400);

  const foundUserGame = await prisma.userGame.findUnique({
    where: {
      userIdGameId: {
        userId,
        igdbGameId
      }
    }
  });
  if (!foundUserGame) throw new AppError("Game not found in user's library", 404);

  const updatedData = req.body;
  const data: Prisma.UserGameUncheckedUpdateInput = {};
  if (Object.hasOwn(updatedData, 'libraryPlatform')) {
    data['libraryPlatformId'] = updatedData.libraryPlatform.id
  }
  if (Object.hasOwn(updatedData, 'libraryFormat')) {
    data['libraryFormat'] = updatedData.libraryFormat.enum
  }
  if (Object.hasOwn(updatedData, 'libraryStatus')) {
    data['libraryStatus'] = updatedData.libraryStatus.enum
  }

  const updatedGame = await prisma.userGame.update({
    where: {
      userIdGameId: {
        userId,
        igdbGameId
      }
    },
    data
  });

  res.status(200).json({
    message: "Game updates in user's library",
    updatedGame
  })
}

export const remove = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const igdbGameId = Number(req.params.gameId);
  if (isNaN(userId) || isNaN(igdbGameId)) throw new AppError("Invalid user id or game id", 400);

  const foundUser = await prisma.user.findUnique({
    where: { id: userId }
  })
  if (!foundUser) throw new AppError("User not found", 404);

  const foundUserGame = await prisma.userGame.findUnique({
    where: {
      userIdGameId: {
        userId,
        igdbGameId
      }
    }
  })
  if (!foundUserGame) throw new AppError("Game not found in user's library", 404);

  await prisma.userGame.delete({
    where: {
      userIdGameId: {
        userId,
        igdbGameId
      },
    }
  })

  res.status(204).send();
}