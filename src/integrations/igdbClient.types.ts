export type RawGame = {
  id: number,
  name: string,
  slug: string,
  cover?: {
    id: number,
    image_id: string
  },
  summary?: string,
  release_dates?: {
    date: number,
    release_region: number
  }[],
  total_rating?: number,
  total_rating_count?: number,
  age_ratings: {
    organization: {
      id: number,
      name: string,
    },
    rating_category?: {
      id: number,
      rating: string
    },
    rating_content_descriptions?: {
      id: number,
      description: string
    }[]
  }[],
  involved_companies?: {
    id: number,
    company: {
      id: number,
      name: string,
    },
    developer: boolean,
    publisher: boolean,
  }[],
  screenshots: {
    id: number,
    image_id: string
  }[],
  checksum: string,
  game_type: number,
  parent_game?: number,
  genres: number[],
  themes: number[],
  platforms: number[],
  dlcs: number[],
  expanded_games: number[],
  expansions: number[],
  standalone_expansions: number[],
  collections: number[],
  franchises: number[],
}

export type RawGameType = {
  id: number,
  type: string,
  checksum: string
}

export type RawGenre = {
  id: number,
  name: string,
  checksum: string
}

export type RawTheme = {
  id: number,
  name: string,
  checksum: string
}

export type RawPlatformFamily = {
  id: number,
  name: string,
  slug: string,
  checksum: string
}

export type RawPlatform = {
  id: number,
  name: string,
  abbreviation: string,
  platform_family: number,
  checksum: string
}

export type RawCollection = {
  id: number,
  name: string,
  checksum: string
}

export type RawFranchise = {
  id: number,
  name: string,
  checksum: string
}

export type RawTimeToBeat = {
  id: number,
  game_id: number,
  hastily: number,
  normally: number,
  completely: number,
  count: number,
  checksum: string
}