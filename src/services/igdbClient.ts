import axios from "axios";
import { igdbConfig } from "../config/index.js";

export type RawGame = {
  id: number,
  name: string,
  slug: string,
  cover?: {
    id: number,
    url: string
  },
  summary?: string,
  release_dates?: {
    date: number,
    release_region: number
  }[],
  total_rating?: number,
  total_rating_count?: number,
  checksum: string,
  game_type: number,
  genres: number[],
  themes: number[],
  platforms: number[]
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

export type RawPlatform = {
  id: number,
  name: string,
  abbreviation: string,
  checksum: string
}

/**
 * todo add the following to the RawGame type / types and add to database after normalizing
 * fields used in .index method GameOverviewDTO
 * cover.url - send back valid url or no image url
 *
 * fields used in .show method GameDetailsDTO
 * age_ratings
 * collections
 * dlcs, expanded games, expansions
 * franchises
 * involved_companies
 * parent_game
 * similar_games
 * standalone_expansions
 *
 */


export const IgdbClient = {
  async getGames (limit: number, offset: number) {
    // todo test with platform 508 only
    // where platforms = (167,48,169,49,130,508,3,14,6)

    let data = `fields 
    age_ratings.organization,age_ratings.rating_content_descriptions.*,
    checksum,
    collections.name,collections.games,
    cover.url,
    dlcs,expanded_games,expansions,
    franchises,
    game_type,
    genres,
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
    & game_type = (0,1,2,3,4,8,9,10,11)
    & themes != 42
    & release_dates.release_region = (2,8);
    
    limit ${limit};
    offset ${offset};
    `;

    const response = await axios.post(`${igdbConfig.baseUrl}/games`, data, {
      headers: igdbConfig.headers
    })

    return response.data;
  },

  async getGameTypes () {
    let data = `
    fields id, type, checksum;
    where id = (0,1,2,3,4,8,9,10,11);
    limit 50;`;

    const response = await axios.post(`${igdbConfig.baseUrl}/game_types`, data, {
      headers: igdbConfig.headers
    });
    return response.data;
  },

  async getGenres () {
    let data = `
    fields id, name, checksum;
    limit 50;
    `;

    const response = await axios.post(`${igdbConfig.baseUrl}/genres`, data, {
      headers: igdbConfig.headers
    })
    return response.data;
  },

  async getThemes () {
    let data = `fields
    id, name, checksum;
    where id != 42;
    limit 50;
    `;
    try {
      const response = await axios.post(`${igdbConfig.baseUrl}/themes`, data, {
        headers: igdbConfig.headers
      });
      return response.data;
    }
    catch (e) {
      console.error(`Error fetching themes: ${e}`)
    }
  },

  async getPlatforms () {
    const data = `fields
    id, name, abbreviation, checksum;
    where id = (167,48,169,49,130,508,3,14,6);
    limit 50;
    `;

    try {
      const response = await axios.post(`${igdbConfig.baseUrl}/platforms`, data, {
        headers: igdbConfig.headers
      })
      return response.data;
    }
    catch (e) {
      console.error(`Error fetching platforms: ${e}`)
    }
  }
}