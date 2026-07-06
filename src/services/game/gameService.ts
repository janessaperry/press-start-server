import {
  GAME_TYPE_FILTERS,
  RELEASE_DATE_FILTERS,
  TIME_TO_BEAT_FILTERS,
  TOTAL_RATING_FILTERS
} from "../../controllers/filtersController";
import { prisma } from "../../db/client.js";
import { Game, Prisma } from "../../generated/prisma/client.js";
import { getReleaseDateOffset } from "../../utils/dateUtils";

type IdLabelDTO = {
  id: number,
  label: string
}

type GameDTO = {
  id: number,
  name: string,
  slug: string,
  coverId: string | null,
  summary: string | null,
  releaseDate: string | null,
  totalRating: number | null,
  gameType: IdLabelDTO,
  developers: string[],
  publishers: string[],
  screenshotIds: string[],
  esrbRating: string | null,
  esrbThumbnailId: string | null,
  esrbDescriptions: string[],
  genres: IdLabelDTO[],
  platforms: IdLabelDTO[],
  timeToBeat: {
    times: {
      label: string;
      value: number | null
    }[],
    count: number | null,
  } | null,
  collections: {
    id: number,
    name: string,
    games: {
      id: number,
      name: string,
      slug: string
      coverId: string | null,
    }[]
  }[],
  franchises: {
    id: number,
    name: string,
    games: {
      id: number,
      name: string,
      slug: string
      coverId: string | null,
    }[]
  }[],
  baseGame: {
    id: number,
    name: string,
    coverId: string | null,
    slug: string
  } | null,
  relatedContent: {
    expansions: {
      id: number,
      name: string,
      coverId: string | null,
      slug: string,
      gameType: IdLabelDTO
    }[],
    dlcs: {
      id: number,
      name: string,
      coverId: string | null,
      slug: string,
      gameType: IdLabelDTO
    }[],
  },
}

export const
  gameOverviewSelect = {
    id: true,
    name: true,
    coverId: true,
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

export type GameOverview = Prisma.GameGetPayload<{ select: typeof gameOverviewSelect }>;

export type GameOverviewDTO =
  Pick<GameDTO,
    | "id"
    | "name"
    | "slug"
    | "coverId"
    | "totalRating"
    | "gameType"
    | "platforms"
  >

const gameDetailsSelect = {
  id: true,
  name: true,
  coverId: true,
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
    },
    orderBy: {
      abbreviation: 'asc',
    }
  },
  timeToBeat: {
    select: {
      hastily: true,
      normally: true,
      completely: true,
      count: true,
    }
  },
  collections: {
    select: {
      id: true,
      name: true,
      games: {
        select: {
          id: true,
          name: true,
          slug: true,
          coverId: true
        }
      }
    }
  },
  franchises: {
    select: {
      id: true,
      name: true,
      games: {
        select: {
          id: true,
          name: true,
          slug: true,
          coverId: true
        }
      }
    }
  },
  developers: true,
  publishers: true,
  screenshotIds: true,
  esrbRating: true,
  esrbThumbnailId: true,
  esrbDescriptions: true,
  baseGame: {
    select: {
      id: true,
      name: true,
      slug: true,
      coverId: true,
    }
  },
  relatedContent: {
    select: {
      id: true,
      name: true,
      coverId: true,
      slug: true,
      gameType: {
        select: {
          id: true,
          label: true
        }
      },
    }
  }
} satisfies Prisma.GameSelect;

export type GameDetails = Prisma.GameGetPayload<{ select: typeof gameDetailsSelect }>;

export type GameDetailsDTO =
  Pick<GameDTO,
    | "id"
    | "name"
    | "slug"
    | "coverId"
    | "summary"
    | "releaseDate"
    | "totalRating"
    | "esrbRating"
    | "esrbThumbnailId"
    | "esrbDescriptions"
    | "developers"
    | "publishers"
    | "timeToBeat"
    | "screenshotIds"
    | "gameType"
    | "genres"
    | "platforms"
    | "collections"
    | "franchises"
    | "baseGame"
    | "relatedContent"
  >

export type GameFilters = {
  search?: string;
  platformFamily?: string;
  platform?: string;
  genres?: string;
  gameType?: string;
  themes?: string;
  franchises?: string;
  timeToBeat?: string;
  totalRating?: string;
  releaseDate?: string;
  esrbRating?: string;
  status?: string;
  parsedLimit: number;
  parsedOffset: number;
  sortCategory: string;
  sortOrder: string;
}

export const GameService = {
  async findById (id: number): Promise<Game | null> {
    return prisma.game.findUnique({
      where: { id }
    })
  },

  async findAll (filters: GameFilters) {
    const {
      search,
      platformFamily, platform,
      genres, gameType, themes, franchises,
      timeToBeat, totalRating, releaseDate, esrbRating,
      parsedLimit, parsedOffset,
      sortCategory, sortOrder
    } = filters;

    let gameTypeQuery: number[] = [];
    if (gameType) {
      const selectedIds = gameType.split(",").map(id => Number(id.trim()));
      const matchedFilters = selectedIds.map(id => GAME_TYPE_FILTERS.find(gtFilter => gtFilter.id === id)).filter(Boolean) as typeof GAME_TYPE_FILTERS;
      gameTypeQuery = matchedFilters.flatMap(gtFilter => gtFilter.gameTypeIds);
    }
    if (!gameType || gameTypeQuery.length === 0) {
      gameTypeQuery = [ 0 ];
    }

    let timeToBeatOrQuery: { normally: { gte: number, lte: number | undefined } }[] = [];
    if (timeToBeat) {
      const selectedTtbIds = timeToBeat.split(",").map(ttb => Number(ttb.trim()));
      const ranges = selectedTtbIds.map(ttbId => TIME_TO_BEAT_FILTERS.find(ttbFilter => ttbFilter.id === ttbId)).filter(Boolean) as typeof TIME_TO_BEAT_FILTERS;
      timeToBeatOrQuery = ranges.map(ttbRange => {
        return {
          normally: {
            gte: ttbRange.min,
            lte: ttbRange.max ? ttbRange.max : undefined
          }
        }
      })
    }

    let totalRatingWhereQuery: number | undefined = undefined;
    if (totalRating) {
      const selectedRatings = totalRating.split(",").map(rating => Number(rating.trim())).filter(Boolean);
      const validSelections = selectedRatings.map(rating => TOTAL_RATING_FILTERS.find(ratingFilter => ratingFilter.id === rating)).filter(Boolean) as typeof TOTAL_RATING_FILTERS;
      for (let i = 0; i < validSelections.length; i++) {
        if (!totalRatingWhereQuery || validSelections[i].min < totalRatingWhereQuery) totalRatingWhereQuery = validSelections[i].min;
      }
    }

    let releaseDateOrQuery: { releaseDate: { lte: Date, gte: Date } | null }[] = [];
    const todayDate = new Date(Date.now());
    if (releaseDate) {
      const selectedReleaseDates: number[] = releaseDate.split(",").map(releaseDate => Number(releaseDate.trim()));
      const validReleaseDates = selectedReleaseDates.map(releaseDateId => RELEASE_DATE_FILTERS.find(releaseDateFilter => releaseDateId === releaseDateFilter.id)).filter((Boolean)) as typeof RELEASE_DATE_FILTERS;

      releaseDateOrQuery = validReleaseDates.map(rd => {
        if (rd.id === 3) return { releaseDate: null };
        return {
          releaseDate: {
            gte: rd.minMonths === 0 ? todayDate : getReleaseDateOffset(todayDate, rd.minMonths as number),
            lte: rd.maxMonths === 0 ? todayDate : getReleaseDateOffset(todayDate, rd.maxMonths as number),
          }
        }
      })
    }

    /**
     * sorting notes - need to validate still
     * categories: createdAt, name, releaseDate
     * orders: asc, desc
     */
    let whereQuery: {} = {
      gameTypeId: {
        in: gameTypeQuery
      }
    };
    let takeQuery = parsedLimit;
    let skipQuery = parsedOffset;
    const orderByQuery = { [sortCategory]: sortOrder }

    if (search) {
      whereQuery = {
        name: {
          contains: search,
          mode: 'insensitive'
        },
      }
    }

    if (platformFamily) {
      whereQuery = {
        ...whereQuery,
        platforms: {
          some: {
            platformFamily: {
              id: {
                in: platformFamily.split(",").map(id => Number(id.trim()))
              },
            }
          }
        }
      }
    }

    if (platform) {
      whereQuery = {
        ...whereQuery,
        platforms: {
          some: {
            id: {
              in: platform.split(",").map(id => Number(id.trim()))
            }
          }
        }
      }
    }

    if (genres) {
      whereQuery = {
        ...whereQuery,
        genres: {
          some: {
            id: {
              in: genres.split(",").map(id => Number(id.trim()))
            }
          }
        }
      }
    }

    if (themes) {
      whereQuery = {
        ...whereQuery,
        themes: {
          some: {
            id: {
              in: themes.split(",").map(id => Number(id.trim()))
            }
          }
        }
      }
    }

    if (franchises) {
      whereQuery = {
        ...whereQuery,
        franchises: {
          some: {
            id: {
              in: franchises.split(",").map(id => Number(id.trim()))
            }
          }
        }
      }
    }

    if (timeToBeatOrQuery.length > 0) {
      whereQuery = {
        ...whereQuery,
        timeToBeat: {
          is: { OR: timeToBeatOrQuery },
          isNot: null
        }
      }
    }

    if (totalRatingWhereQuery) {
      whereQuery = {
        ...whereQuery,
        totalRating: {
          gte: totalRatingWhereQuery
        }
      }
    }

    if (releaseDateOrQuery.length > 0) {
      whereQuery = {
        ...whereQuery,
        OR: releaseDateOrQuery
      }
    }

    let result = await prisma.game.findMany({
      where: whereQuery,
      take: takeQuery,
      skip: skipQuery,
      select: gameOverviewSelect,
      orderBy: orderByQuery,
    });
    const count = await prisma.game.count({ where: whereQuery });

    return {
      games: result.map(mapToGameOverviewDTO),
      count
    };
  },

  async findByName (query: string) {
    return prisma.game.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        coverId: true,
      },
      take: 10
    })
  },

  async getGameDetails (gameId: number): Promise<GameDetailsDTO | null> {
    try {
      const foundGame = await prisma.game.findUnique({
        where: { id: Number(gameId) },
        select: gameDetailsSelect,
      });
      if (!foundGame) return null;

      const genres = mapGenresToDTO(foundGame.genres);
      const platforms = mapPlatformsToDTO(foundGame.platforms);
      const expansions = foundGame.relatedContent.filter(relatedGame => relatedGame.gameType.id === 2 || relatedGame.gameType.id === 4 || relatedGame.gameType.id === 10)
      const dlcs = foundGame.relatedContent.filter(relatedGame => relatedGame.gameType.id === 1);
      const timeToBeat = mapTimeToBeatToDTO(foundGame.timeToBeat);

      return {
        id: foundGame.id,
        name: foundGame.name,
        coverId: foundGame.coverId,
        releaseDate: foundGame.releaseDate ? foundGame.releaseDate.toISOString() : null,
        slug: foundGame.slug,
        summary: foundGame.summary,
        totalRating: foundGame.totalRating,
        gameType: foundGame.gameType,
        developers: foundGame.developers,
        publishers: foundGame.publishers,
        screenshotIds: foundGame.screenshotIds,
        genres,
        platforms,
        timeToBeat,
        collections: foundGame.collections,
        franchises: foundGame.franchises,
        esrbRating: foundGame.esrbRating || null,
        esrbThumbnailId: foundGame.esrbThumbnailId ?? null,
        esrbDescriptions: foundGame.esrbDescriptions,
        baseGame: foundGame.baseGame,
        relatedContent: {
          expansions,
          dlcs
        }
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
        coverId: true,
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
        coverId: true,
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

export function mapToGameOverviewDTO (game: GameOverview): GameOverviewDTO {
  const platforms = mapPlatformsToDTO(game.platforms);

  return {
    id: game.id,
    name: game.name,
    coverId: game.coverId,
    slug: game.slug,
    totalRating: game.totalRating,
    platforms,
    gameType: game.gameType,
  }
}

function mapGenresToDTO (genres: GameDetails["genres"]): IdLabelDTO[] {
  return genres.map(genre => ({ id: genre.id, label: genre.name }))
}

function mapPlatformsToDTO (platforms: GameDetails["platforms"]): IdLabelDTO[] {
  return platforms.map(platform => ({ id: platform.id, label: platform.abbreviation }));
}

function mapTimeToBeatToDTO (timeToBeat: GameDetails["timeToBeat"]): GameDetailsDTO["timeToBeat"] | null {
  return timeToBeat ? {
    times: [
      { label: "hastily", value: timeToBeat.hastily },
      { label: "normally", value: timeToBeat.normally },
      { label: "completely", value: timeToBeat.completely },
    ],
    count: timeToBeat.count
  } : null;
}