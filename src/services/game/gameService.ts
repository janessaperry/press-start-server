import { prisma } from "../../db/client.js";
import { Game, Prisma } from "../../generated/prisma/client.js";


type IdLabelDTO = {
  id: number,
  label: string
}

type GameDTO = {
  id: number,
  name: string,
  slug: string,
  coverUrl: string | null,
  summary: string[],
  releaseDate: string | null,
  totalRating: number | null,
  gameType: IdLabelDTO,
  developers: string[],
  publishers: string[],
  esrbRating: string | null,
  esrbThumbnailUrl: string | null,
  esrbDescriptions: string[],
  genres: IdLabelDTO[],
  platforms: IdLabelDTO[],
  baseGame: {
    id: number,
    name: string,
    coverUrl: string | null
  } | null,
}

const gameOverviewSelect = {
  id: true,
  name: true,
  coverUrl: true,
  releaseDate: true,
  slug: true,
  totalRating: true,
  platforms: {
    select: {
      id: true,
      abbreviation: true,
    }
  },
  gameType: {
    select: {
      id: true,
      label: true
    }
  },
} satisfies Prisma.GameSelect;

type GameOverview = Prisma.GameGetPayload<{select: typeof gameOverviewSelect}>;

type GameOverviewDTO =
  Pick<GameDTO,
    | "id"
    | "name"
    | "slug"
    | "coverUrl"
    | "totalRating"
    | "gameType"
    | "platforms"
  >

const gameDetailsSelect = {
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
      id: true,
      name: true,
    }
  },
  platforms: {
    select: {
      id: true,
      abbreviation: true,
    }
  },
  developers: true,
  publishers: true,
  esrbRating: true,
  esrbThumbnailUrl: true,
  esrbDescriptions: true,
  baseGame: {
    select: {
      id: true,
      name: true,
      coverUrl: true,
    }
  }
} satisfies Prisma.GameSelect;

export type GameDetails = Prisma.GameGetPayload<{select: typeof gameDetailsSelect}>;

export type GameDetailsDTO =
  Pick<GameDTO,
    | "id"
    | "name"
    | "slug"
    | "coverUrl"
    | "summary"
    | "releaseDate"
    | "totalRating"
    | "esrbRating"
    | "esrbThumbnailUrl"
    | "esrbDescriptions"
    | "developers"
    | "publishers"
    | "gameType"
    | "genres"
    | "platforms"
    | "baseGame"
  >

export const GameService = {
  async findById (id: number): Promise<Game | null> {
    return prisma.game.findUnique({
      where: {id}
    })
  },

  async findByName (query: string, select: Prisma.GameSelect): Promise<Game[] | null> {
    return prisma.game.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select,
      take: 10
    })
  },

  async getGameDetails (gameId: number): Promise<GameDetailsDTO | null> {
    try {
      const foundGame = await prisma.game.findUnique({
        where: {id: Number(gameId)},
        select: gameDetailsSelect
      });
      if (!foundGame) return null;

      const genres = mapGenresToDTO(foundGame.genres);
      const platforms = mapPlatformsToDTO(foundGame.platforms);

      return {
        id: foundGame.id,
        name: foundGame.name,
        coverUrl: foundGame.coverUrl,
        releaseDate: foundGame.releaseDate ? foundGame.releaseDate.toISOString() : null,
        slug: foundGame.slug,
        summary: splitSummary(foundGame.summary),
        totalRating: foundGame.totalRating,
        gameType: foundGame.gameType,
        developers: foundGame.developers,
        publishers: foundGame.publishers,
        genres,
        platforms,
        esrbRating: foundGame.esrbRating || null,
        esrbThumbnailUrl: foundGame.esrbThumbnailUrl ?? null,
        esrbDescriptions: foundGame.esrbDescriptions,
        baseGame: foundGame.baseGame,
      }
    }
    catch (e) {
      console.error(`Error getting game details: ${e}`);
      return null;
    }
  },

  async findComingSoonGames () {
    let oneYearAhead = new Date();
    oneYearAhead.setMonth(oneYearAhead.getMonth() + 12);

    const data = await prisma.game.findMany({
      where: {
        releaseDate: {
          gte: new Date(Date.now()),
          lte: oneYearAhead
        }
      },
      orderBy: {
        releaseDate: 'asc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        coverUrl: true,
        releaseDate: true,
        totalRating: true,
        platforms: {
          select: {
            id: true,
            abbreviation: true,
          }
        },
        gameType: {
          select: {
            id: true,
            label: true
          }
        },
      },
      take: 18
    });

    return data.map(game => mapToGameOverviewDTO(game));
  },

  async findNewReleaseGames () {
    let sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const data = await prisma.game.findMany({
      where: {
        releaseDate: {
          gte: sixMonthsAgo,
          lte: new Date()
        }
      },
      orderBy: {
        releaseDate: 'desc'
      },
      select: {
        id: true,
        name: true,
        coverUrl: true,
        releaseDate: true,
        slug: true,
        totalRating: true,
        platforms: {
          select: {
            id: true,
            abbreviation: true,
          }
        },
        gameType: {
          select: {
            id: true,
            label: true,
          }
        },
      },
      take: 18
    })

    return data.map(game => mapToGameOverviewDTO(game));
  },

}

function mapToGameOverviewDTO (game: GameOverview): GameOverviewDTO {
  const platforms = mapPlatformsToDTO(game.platforms)

  return {
    id: game.id,
    name: game.name,
    coverUrl: game.coverUrl,
    slug: game.slug,
    totalRating: game.totalRating,
    platforms,
    gameType: game.gameType,
  }
}

function splitSummary (summary: string | null): string[] {
  if (!summary) return [];

  let summaryArr = summary.split("\n");
  summaryArr = summaryArr.filter(string => string !== "");
  return summaryArr;
}

function mapGenresToDTO (genres: GameDetails["genres"]): IdLabelDTO[] {
  return genres.map(genre => ({id: genre.id, label: genre.name}))
}

function mapPlatformsToDTO (platforms: GameDetails["platforms"]): IdLabelDTO[] {
  return platforms.map(platform => ({id: platform.id, label: platform.abbreviation}));
}