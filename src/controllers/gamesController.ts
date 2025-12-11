import { Request, Response } from "express";
import { GameService } from "../services/gameService.js";
import { prisma } from "../db/client.js";
import { Console, Genre } from "@prisma/client";

interface GameQuery {
  search?: string,
  console?: string,
  status?: string,
}

type GenreDTO = {
  id: number,
  label: string
}

type ConsoleDTO = {
  id: number,
  label: string
}

type GameDetailsDTO = {
  id: number,
  name: string,
  coverUrl: string,
  releaseDate: string,
  slug: string,
  summary: string[] | undefined,
  totalRating: string,
  gameType: string | undefined
  genres: GenreDTO[],
  consoles: ConsoleDTO[]
}

export const index = async (req: Request<any, any, any, GameQuery>, res: Response) => {
  const {search, console, status} = req.query;

  let searchResults;
  if (search) {
    const select = {
      id: true,
      name: true,
      coverUrl: true,
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

  const foundGame = await prisma.game.findUnique({
    where: {id: Number(gameId)},
    select: {
      id: true,
      name: true,
      coverUrl: true,
      releaseDate: true,
      slug: true,
      summary: true,
      totalRating: true,
      gameTypeId: true,
      gameType: {
        select: {
          id: true,
          label: true
        }
      },
      genres: {
        select: {
          genre: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      consoles: {
        select: {
          console: {
            select: {
              id: true,
              abbreviation: true
            }
          }
        }
      }
    }
  });
  if (!foundGame) return;

  const flattenedGenres: Pick<Genre, "id" | "name">[] = foundGame.genres.map((g: {
    genre: Pick<Genre, "id" | "name">
  }) => g.genre);
  const flattenedConsoles: Pick<Console, "id" | "abbreviation">[] = foundGame.consoles.map((c: {
    console: Pick<Console, "id" | "abbreviation">
  }) => c.console);
  console.log(foundGame)

  const gameDetails: GameDetailsDTO = {
    id: foundGame.id,
    name: foundGame.name,
    coverUrl: foundGame.coverUrl,
    releaseDate: formatReleaseDate(foundGame.releaseDate),
    slug: foundGame.slug,
    summary: formatSummary(foundGame.summary),
    totalRating: formatRating(foundGame.totalRating),
    gameType: formatGameType(foundGame.gameType),
    genres: mapGenresToDTO(flattenedGenres),
    consoles: mapConsolesToDTO(flattenedConsoles)
  };


  res.status(200).json({
    "message": `request made to /show/${gameId}`,
    gameDetails
  })
}


function formatReleaseDate (date: Date | null): string {
  return date ? date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) : "Release date unknown";
}

function formatRating (rating: number | null): string {
  return rating ? String(rating) : 'n/a';
}

function formatGameType (gameType: {id: number; label: string;}): string | undefined {
  if (gameType.id !== 0) {
    return gameType.label;
  }
  else {
    return undefined;
  }
}

function formatSummary (summary: string | null): string[] | undefined {
  if (!summary) return undefined;

  let summaryArr = summary.split("\n");
  summaryArr = summaryArr.filter(string => string !== "");
  return summaryArr;
}

function mapGenresToDTO (genres: Pick<Genre, "id" | "name">[]): GenreDTO[] {
  return genres.map(g => {
    return {
      id: g.id,
      label: g.name,
    }
  })
}

function mapConsolesToDTO (consoles: Pick<Console, "id" | "abbreviation">[]): ConsoleDTO[] {
  return consoles.map(c => ({id: c.id, label: c.abbreviation}));
}