import { Prisma } from "../../generated/prisma/client.js";

/***** Shared Types *****/
export type IdLabelDTO = {
  id: number,
  label: string
}


/***** Master Game DTO Shape *****/
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


/***** Game Overview *****/
export const gameOverviewSelect = {
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

export type GameOverviewRow = Prisma.GameGetPayload<{ select: typeof gameOverviewSelect }>;

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


/***** Game Details *****/
export const gameDetailsSelect = {
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

export type GameDetailsRow = Prisma.GameGetPayload<{ select: typeof gameDetailsSelect }>;

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


/***** Query Filters *****/
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