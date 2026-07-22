import { Prisma } from "../generated/prisma/client.js";
import { GameFilters } from "./game/gameService.types";

/***** Library Game Overview *****/
export const libraryGameSelect = {
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
      timeToBeat: {
        select: {
          id: true,
          normally: true,
        }
      }
    },
  },
} satisfies Prisma.UserGameSelect;


/***** Query Filters *****/
export type LibraryGameFilters = {
  libraryStatus?: string;
  libraryFormat?: string;
} & Partial<GameFilters>;