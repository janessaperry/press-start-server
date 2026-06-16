import { Request, Response } from "express";
import { prisma } from "../db/client.js";
import { LibraryStatus } from "../generated/prisma/enums.js";
import { LIBRARY_FORMAT_FILTERS, LIBRARY_STATUS_FILTERS } from "./filtersController";

// const VALID_STATUSES = Object.values(LibraryStatus);
// function labelToEnum (label: string): string {
//   return label.toUpperCase().replaceAll(" ", "_");
// }

type CreateLibraryBody = {
  gameId: number;
  libraryPlatform?:  {id: number, label: string};
  libraryFormat?:  {id: number, label: string};
  libraryStatus?: {id: number, label: string};
};

export const index = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);

  if (isNaN(userId)) {
    res.status(400).json({ message: "invalid user id" });
    return;
  }

  const library = await prisma.userGame.findMany({
    where: { userId },
    include: {
      gameDetails: true,
      libraryPlatform: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ library });
};

export const show = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const igdbGameId = Number(req.params.gameId);

  const foundGame = await prisma.userGame.findUnique({
    where: {
      userIdGameId: {
        userId, igdbGameId
      }
    },
    select: {
      libraryPlatform: {
        select: {
          id: true,
          abbreviation: true
        }
      },
      libraryFormat: true,
      libraryStatus: true,
    }
  })

  if (!foundGame) {
    res.status(404).json({
      message: "library show method: game not found"
    });
    return;
  }

  res.status(200).json({
    message: "library show method: game details",
    libraryPlatform: foundGame.libraryPlatform ? {
      id: foundGame.libraryPlatform.id,
      label: foundGame.libraryPlatform.abbreviation
    } : undefined,
    libraryFormat: foundGame.libraryFormat ? LIBRARY_FORMAT_FILTERS.find(item => foundGame.libraryFormat === item.enum) : undefined,
    libraryStatus: foundGame.libraryStatus ? LIBRARY_STATUS_FILTERS.find(item => foundGame.libraryStatus === item.enum) : undefined,
  })
  return;
}

export const create = async (req: Request<any, any, CreateLibraryBody>, res: Response) => {
  const userId = Number(req.params.userId);

  if (isNaN(userId)) {
    res.status(400).json({ message: "invalid user id" });
    return;
  }

  const igdbGameId = Number(req.body.gameId);
  if (!igdbGameId) {
    res.status(400).json({ message: "igdbGameId is required" });
    return;
  }

  const rawLibraryPlatform = req.body.libraryPlatform;
  let libraryPlatformId = rawLibraryPlatform && rawLibraryPlatform.id !== 0 ? rawLibraryPlatform.id : null;
  const validPlatform = libraryPlatformId && await prisma.platform.findUnique({
    where: {id: libraryPlatformId}
  });
  // set invalid platform to null since it's optional anyway. this is really only for direct api requests.
  if (!validPlatform) libraryPlatformId = null;

  const rawLibraryFormat = req.body.libraryFormat;
  const libraryFormat = LIBRARY_FORMAT_FILTERS.find(filter => filter.id === rawLibraryFormat?.id)?.enum ?? null;

  const rawLibraryStatus = req.body.libraryStatus;
  const libraryStatus = LIBRARY_STATUS_FILTERS.find(filter => filter.id === rawLibraryStatus?.id)?.enum ?? LibraryStatus.WANT_TO_PLAY;

  const existing = await prisma.userGame.findFirst({ where: { userId, igdbGameId } });
  if (existing) {
    res.status(409).json({ message: "game already in library" });
    return;
  }

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
  res.status(200).json({
    message: "testing update endpoint response"
  })
  return
}

export const remove = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const igdbGameId = Number(req.params.gameId);

  const foundUser = await prisma.user.findUnique({
    where: { id: userId }
  })
  if (!foundUser) {
    res.status(404).json({
      message: "User not found"
    })
    return;
  }

  const foundUserGame = await prisma.userGame.findUnique({
    where: {
      userIdGameId: {
        userId,
        igdbGameId
      }
    }
  })
  if (!foundUserGame) {
    res.status(404).json({
      message: "Game not found in user's library."
    })
    return;
  }

  const deletedItem = await prisma.userGame.delete({
    where: {
      userIdGameId: {
        userId,
        igdbGameId
      },
    },
    select: {
      id: true,
      userId: true,
      igdbGameId: true
    }
  })

  res.status(200).json({
    message: `Game ${igdbGameId} removed from user ${userId}'s library.`
  })
}