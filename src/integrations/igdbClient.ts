import axios, { AxiosError } from "axios";
import { getIgdbConfig, igdbOAuthConfig } from "../config";
import { ExternalServiceError } from "../errors/AppError";
import { logger } from "../errors/logger";
import {
  IgdbTokenResponse,
  RawCollection,
  RawFranchise,
  RawGame,
  RawGameType,
  RawGenre,
  RawPlatform,
  RawPlatformFamily,
  RawTheme,
  RawTimeToBeat
} from "./igdbClient.types";


const MAX_RETRIES = 3;

function sleep (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function igdbPost<T> (url: string, data?: string, config?: { headers: Record<string, string> }): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      const response = await axios.post(url, data, config);
      return response.data;
    } catch (e) {
      if (e instanceof AxiosError) {
        const status = e.response?.status;

        if (status === 429 && attempt < MAX_RETRIES) {
          const retryAfterHeader = e.response?.headers['retry-after'];
          const waitMs = retryAfterHeader
            ? parseInt(retryAfterHeader, 10) * 1000
            : Math.pow(2, attempt) * 1000;

          logger.warn(`IGDB rate limited. Retrying in ${waitMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})...`);
          await sleep(waitMs);
          attempt++;
          continue;
        }

        throw new ExternalServiceError(`IGDB API error (${status ?? e.code ?? 'network error'})`);
      }
      throw e;
    }
  }
}

export const IgdbClient = {
  async generateToken (): Promise<IgdbTokenResponse> {
    const response = await axios.post(igdbOAuthConfig.url, igdbOAuthConfig.body, { headers: igdbOAuthConfig.headers });
    return response.data;
  },

  async getGames (limit: number, offset: number): Promise<RawGame[]> {
    const igdbConfig = await getIgdbConfig();

    const data = `fields
    age_ratings.organization.name,age_ratings.rating_category.rating,age_ratings.rating_content_descriptions.description,
    checksum,
    collections,
    cover.image_id,
    dlcs,expanded_games,expansions,
    franchises,
    game_type,
    genres,
    involved_companies.company.name,involved_companies.company.parent.name,involved_companies.developer,involved_companies.publisher,
    name,
    parent_game,
    platforms,
    release_dates.date,release_dates.release_region,
    screenshots.id, screenshots.image_id,
    similar_games,
    slug,
    standalone_expansions,
    summary,
    themes,
    total_rating,total_rating_count;

    where platforms = (167,48,169,49,130,508,3,14,6)
    & age_ratings.organization = 1
    & game_type = (0,1,2,3,4,8,9,10,11)
    & themes != (42)
    & release_dates.release_region = (2,8)
    & name !~ *"hentai"*;

    limit ${limit};
    offset ${offset};
    `;

    return igdbPost<RawGame[]>(`${igdbConfig.baseUrl}/games`, data, { headers: igdbConfig.headers });
  },

  async getGameTypes (): Promise<RawGameType[]> {
    const igdbConfig = await getIgdbConfig();
    const data = `
    fields id, type, checksum;
    where id = (0,1,2,3,4,8,9,10,11);
    limit 50;`;

    return igdbPost(`${igdbConfig.baseUrl}/game_types`, data, { headers: igdbConfig.headers });
  },

  async getGenres (): Promise<RawGenre[]> {
    const igdbConfig = await getIgdbConfig();
    const data = `
    fields id, name, checksum;
    limit 50;
    `;

    return igdbPost(`${igdbConfig.baseUrl}/genres`, data, { headers: igdbConfig.headers });
  },

  async getThemes (): Promise<RawTheme[]> {
    const igdbConfig = await getIgdbConfig();
    const data = `fields
    id, name, checksum;
    where id != 42;
    limit 50;
    `;

    return igdbPost(`${igdbConfig.baseUrl}/themes`, data, { headers: igdbConfig.headers });
  },

  async getPlatformFamilies (): Promise<RawPlatformFamily[]> {
    const igdbConfig = await getIgdbConfig();
    const data = `fields
    id, name, slug, checksum;
    where id != 3;
    limit 50;
    `;

    return igdbPost(`${igdbConfig.baseUrl}/platform_families`, data, { headers: igdbConfig.headers });
  },

  async getPlatforms (): Promise<RawPlatform[]> {
    const igdbConfig = await getIgdbConfig();
    const data = `fields
    id, name, abbreviation, platform_family, checksum;
    where id = (167,48,169,49,130,508,3,14,6);
    limit 50;
    `;

    return igdbPost(`${igdbConfig.baseUrl}/platforms`, data, { headers: igdbConfig.headers });
  },

  async getCollections (limit: number, offset: number): Promise<RawCollection[]> {
    const igdbConfig = await getIgdbConfig();
    const data = `fields
    id, name, checksum;
    limit ${limit};
    offset ${offset};
    `;

    return igdbPost(`${igdbConfig.baseUrl}/collections`, data, { headers: igdbConfig.headers });
  },

  async getFranchises (limit: number, offset: number): Promise<RawFranchise[]> {
    const igdbConfig = await getIgdbConfig();
    const data = `fields
      id, name, checksum;
      limit ${limit};
      offset ${offset};
    `;

    return igdbPost(`${igdbConfig.baseUrl}/franchises`, data, { headers: igdbConfig.headers });
  },

  async getTimeToBeat (limit: number, offset: number): Promise<RawTimeToBeat[]> {
    const igdbConfig = await getIgdbConfig();
    const data = `fields
      id, game_id, hastily, normally, completely, count, checksum;
      limit ${limit};
      offset ${offset};
    `;

    return igdbPost(`${igdbConfig.baseUrl}/game_time_to_beats`, data, { headers: igdbConfig.headers });
  }
}