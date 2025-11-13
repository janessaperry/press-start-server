import axios from "axios";
import { Game } from "@prisma/client";
import { apiConfig } from "../config/index.js";

interface RawGame {
  id: number,
  name: string,
  slug: string,
  summary?: string,
  release_dates?: {
    date: number,
    release_region: number
  }[],
  total_rating?: number,
  total_rating_count?: number,
  checksum: string
}

export const IgdbClient = {
  async getAll (limit: number, offset: number) {
    // todo platform 508 has 194 responses. test with this one for looping
    // where platforms = (167,48,169,49,130,508,3,14,6)

    let data = `fields 
    age_ratings.organization,age_ratings.rating_content_descriptions.*,
    checksum,
    collections.name,collections.games,
    cover.url,
    dlcs,expanded_games,expansions,
    franchises,
    game_type,
    genres.name,
    involved_companies.company.name,involved_companies.company.parent.name,involved_companies.developer,involved_companies.publisher,
    name,
    parent_game,
    platforms,
    release_dates.date,release_dates.release_region,
    similar_games,
    slug,
    standalone_expansions,
    summary,
    themes,
    total_rating,total_rating_count;
    
    where platforms = (508) 
    & age_ratings.organization = 1
    & game_type = (0,1,2,3,4,8,8,10,11)
    & themes != 42
    & release_dates.release_region = (2,8);
    
    limit ${limit};
    offset ${offset};
    `;

    const response = await axios.post(`${apiConfig.baseUrl}/games`, data, {
      headers: apiConfig.headers
    })

    const normalizedResponse: Game[] = response.data.map((game: RawGame) => {
      return {
        id: game.id,
        name: game.name,
        slug: game.slug,
        summary: game.summary,
        releaseDate: this.normalizeReleaseDates(game.release_dates),
        totalRating: game.total_rating && Math.round(game.total_rating),
        totalRatingCount: game.total_rating_count,
        checksum: game.checksum
      }
    })

    return normalizedResponse;
  },

  normalizeReleaseDates (releaseDates: RawGame["release_dates"]) {
    if ( !releaseDates ) return;

    let releaseDate;
    for ( const date of releaseDates ) {
      if ( date.release_region === 2 || date.release_region === 8 ) {
        if ( !releaseDate || date.date < releaseDate ) releaseDate = date.date;
      }
    }
    if ( !releaseDate ) return;

    return new Date(releaseDate * 1000);
  }
}