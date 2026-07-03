import { LIBRARY_FORMAT_FILTERS, LIBRARY_STATUS_FILTERS } from "../controllers/filtersController";
import { prisma } from "../db/client";
import { Prisma } from "../generated/prisma/client.js";
import { LibraryFormat, LibraryStatus } from "../generated/prisma/enums"
import { GameFilters, mapToGameOverviewDTO } from "./game/gameService";


const libraryGameSelect = {
  id: true,
  libraryStatus: true,
  libraryFormat: true,
  libraryPlatform: {
    select: {
      id: true,
      abbreviation: true,
    },
  },
  gameDetails: {
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
        },
        orderBy: {
          abbreviation: 'asc',
        }
      },
      gameType: {
        select: {
          id: true,
          label: true
        }
      },
    },
  },
} satisfies Prisma.UserGameSelect;

export type LibraryGameFilters = {
  libraryStatus?: string;
  libraryFormat?: string;
} & Partial<GameFilters>;

export const libraryService = {
  async findAll (userId: number, filters: LibraryGameFilters) {
    const {
      libraryStatus, libraryFormat,
      gameType, platform, releaseDate, totalRating, genres, timeToBeat,
      parsedLimit, parsedOffset
    } = filters;
    // console.log("libraryService findAll", filters)

    let whereQuery: {} = {
      userId
    };
    let takeQuery = parsedLimit;
    let skipQuery = parsedOffset;

    // convert to enum based on id
    let libraryStatusQuery: LibraryStatus[] = [];
    if (libraryStatus) {
      libraryStatusQuery = libraryStatus
        .split(",")
        .map(id => LIBRARY_STATUS_FILTERS.find(item => item.id === Number(id.trim()))?.enum)
        .filter((status) => status !== undefined);

      whereQuery = {
        ...whereQuery,
        libraryStatus: {
          in: libraryStatusQuery
        }
      }
    }

    // convert to enum based on id, null is a valid value and filter
    let libraryFormatQuery: (LibraryFormat | null)[] = [];
    if (libraryFormat) {
      const hasNull = libraryFormat.includes('999');
      libraryFormatQuery = libraryFormat
        .split(",")
        .map(id => LIBRARY_FORMAT_FILTERS.find(item => item.id === Number(id.trim()))?.enum)
        .filter((formatEnum) => formatEnum !== undefined && formatEnum !== null)

      const orConditions = [];
      if (libraryFormatQuery.length > 0) orConditions.push({ libraryFormat: { in: libraryFormatQuery } });
      if (hasNull) orConditions.push({ libraryFormat: null })

      whereQuery = {
        ...whereQuery,
        OR: orConditions
      }
    }

    //todo unspecified (null) is a valid platform filter

    const libraryResult = await prisma.userGame.findMany({
      where: whereQuery,
      select: libraryGameSelect,
      take: takeQuery,
      skip: skipQuery,
      orderBy: { createdAt: "desc" },
    });

    const games = libraryResult.map(libraryGame => (
      {
        id: libraryGame.id,
        libraryStatus: libraryGame.libraryStatus ? LIBRARY_STATUS_FILTERS.find(item => item.enum === libraryGame.libraryStatus) : undefined,
        libraryFormat: libraryGame.libraryFormat ? LIBRARY_FORMAT_FILTERS.find(item => item.enum === libraryGame.libraryFormat) : undefined,
        libraryPlatform: libraryGame.libraryPlatform ? {
          id: libraryGame.libraryPlatform.id,
          label: libraryGame.libraryPlatform.abbreviation
        } : undefined,
        gameOverview: mapToGameOverviewDTO(libraryGame.gameDetails)
      }
    ))
    const filteredCount = await prisma.userGame.count({ where: whereQuery });


    return {
      games,
      filteredCount
    };
  },

  async getCounts (userId: number) {
    const libraryStatusCounts = await prisma.userGame.groupBy({
      where: { userId },
      by: [ 'libraryStatus' ],
      _count: true,
    });

    const counts: { label: string, count: number }[] = LIBRARY_STATUS_FILTERS.map((item) => {
      const count = libraryStatusCounts.find((count) => item.enum === count.libraryStatus)?._count ?? 0;
      return { label: item.label, count }
    });

    return counts;
  },

  async findById (userId: number, igdbGameId: number) {
    return await prisma.userGame.findUnique({
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
  }
}