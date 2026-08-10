import {
  LIBRARY_FORMAT_FILTERS,
  LIBRARY_GAME_TYPE_FILTERS,
  LIBRARY_STATUS_FILTERS,
  TIME_TO_BEAT_FILTERS,
  TOTAL_RATING_FILTERS
} from "../constants/filters";
import { prisma } from "../db/client";
import { Prisma } from "../generated/prisma/client.js";
import { LibraryFormat, LibraryStatus } from "../generated/prisma/enums"
import { mapToGameOverviewDTO } from "./game/gameService";
import { LibraryGameFilters, libraryGameSelect } from "./libraryService.types";

const VALID_SORT_CATEGORIES = [ 'createdAt', 'name', 'releaseDate' ] as const;
const VALID_SORT_ORDERS = [ 'asc', 'desc' ] as const;
type SortCategory = typeof VALID_SORT_CATEGORIES[number];
type SortOrder = typeof VALID_SORT_ORDERS[number];

function buildOrderBy (sortCategory: string | undefined, sortOrder: string | undefined): Prisma.UserGameOrderByWithRelationInput {
  const category: SortCategory = VALID_SORT_CATEGORIES.includes(sortCategory as SortCategory) ? sortCategory as SortCategory : 'createdAt';
  const order: SortOrder = VALID_SORT_ORDERS.includes(sortOrder as SortOrder) ? sortOrder as SortOrder : 'desc';

  if (category === 'name') return { gameDetails: { name: order } };
  if (category === 'releaseDate') return { gameDetails: { releaseDate: { sort: order, nulls: 'last' } } };
  return { createdAt: order };
}

export const libraryService = {
  async findAll (userId: number, filters: LibraryGameFilters) {
    const {
      libraryStatus, libraryFormat,
      gameType, platform, totalRating, genres, timeToBeat,
      parsedLimit, parsedOffset, sortCategory, sortOrder
    } = filters;

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

    // id = 0 is a valid filter for null records in db
    if (platform) {
      const platformIds = platform.split(",").map((id: string) => (Number(id.trim())));
      const orQuery = platformIds.map((id) => {
        if (id === 0) return { libraryPlatformId: null }
        else return { libraryPlatformId: id }
      });

      whereQuery = {
        ...whereQuery,
        OR: orQuery
      }
    }

    let gameDetailsQuery: Prisma.GameWhereInput = {};

    if (gameType) {
      const gameTypeFilterIds = gameType.split(",");
      const gameTypeQuery = gameTypeFilterIds.flatMap((id: string) => LIBRARY_GAME_TYPE_FILTERS
        .find((filter) => filter.id === Number(id))?.gameTypeIds).filter((item) => item !== undefined);
      gameDetailsQuery = {
        ...gameDetailsQuery,
        gameTypeId: { in: gameTypeQuery }
      };
    }

    if (totalRating) {
      const totalRatingIds = totalRating.split(",").map((id) => Number(id.trim()));
      const validRatingIds = totalRatingIds.filter(id => TOTAL_RATING_FILTERS.find(filter => filter.id === id));
      const minRating = validRatingIds.length > 0 ? Math.min(...validRatingIds) : undefined;
      if (minRating !== undefined) {
        const minRatingValue = TOTAL_RATING_FILTERS.find((rating) => rating.id === minRating)!.min;
        gameDetailsQuery = {
          ...gameDetailsQuery,
          totalRating: { gte: minRatingValue }
        };
      }
    }

    if (genres) {
      const genreIds = genres.split(",").map((id: string) => Number(id.trim()));
      gameDetailsQuery = {
        ...gameDetailsQuery,
        genres: {
          some: {
            id: { in: genreIds } }
        }
      };
    }

    if (timeToBeat) {
      const ttbIds = timeToBeat.split(",").map((id: string) => Number(id.trim()));
      const validTtbIds = TIME_TO_BEAT_FILTERS.filter((ttbFilter) => ttbIds.find((id) => id === ttbFilter.id));
      const orConditions = validTtbIds.map((ttbItem) => (
        ttbItem.max === null
          ? { normally: { gte: ttbItem.min } }
          : { normally: { gte: ttbItem.min, lte: ttbItem.max } }
      ));
      if (orConditions.length > 0) {
        gameDetailsQuery = {
          ...gameDetailsQuery,
          timeToBeat: { OR: orConditions }
        };
      }
    }

    if (Object.keys(gameDetailsQuery).length > 0) {
      whereQuery = {
        ...whereQuery,
        gameDetails: gameDetailsQuery
      };
    }

    const libraryResult = await prisma.userGame.findMany({
      where: whereQuery,
      select: libraryGameSelect,
      take: takeQuery,
      skip: skipQuery,
      orderBy: buildOrderBy(sortCategory, sortOrder),
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

    const counts: { enum: LibraryStatus, label: string, count: number }[] = LIBRARY_STATUS_FILTERS.map((item) => {
      const count = libraryStatusCounts.find((count) => item.enum === count.libraryStatus)?._count ?? 0;
      return { enum: item.enum, label: item.label, count }
    });

    return counts;
  },

  async findById (userId: number, igdbGameId: number) {
    const userGame = await prisma.userGame.findUnique({
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
    });

    if (!userGame) return null;

    return {
      libraryPlatform: userGame.libraryPlatform ? {
        id: userGame.libraryPlatform.id,
        label: userGame.libraryPlatform.abbreviation
      } : undefined,
      libraryFormat: userGame.libraryFormat ? LIBRARY_FORMAT_FILTERS.find(item => userGame.libraryFormat === item.enum) : undefined,
      libraryStatus: userGame.libraryStatus ? LIBRARY_STATUS_FILTERS.find(item => userGame.libraryStatus === item.enum) : undefined,
    }
  }
}
