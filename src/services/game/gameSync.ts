import { prisma } from "../../db/client.js";
import { Game, Prisma } from "../../generated/prisma/client.js";
import { IgdbClient, RawGame } from "../igdbClient.js";
import { ENV } from "../../config/env.js";
import { GameDetailsDTO, GameService } from "./gameService";

type Relations = {
  genreIds: number[],
  themeIds: number[],
  platformIds: number[],
}

type SelfRelations = {
  baseGameId: number | null,
  relatedContent: number[]
}

export const GameSync = {
  async createGame (gameDetails: Prisma.GameCreateInput, relations: Relations): Promise<Game> {

    return prisma.game.create({
      data: {
        ...gameDetails,
        genres: {
          connect: relations.genreIds.map((genre) => ({id: genre}))
        },
        themes: {
          connect: relations.themeIds.map((theme) => ({id: theme}))
        },
        platforms: {
          connect: relations.platformIds.map((platform) => ({id: platform}))
        },
      }
    })
  },

  async updateGameById (id: number, gameDetails: Prisma.GameUpdateInput, relations: Relations): Promise<Game> {
    return prisma.game.update({
      where: {id},
      data: {
        name: gameDetails.name,
        slug: gameDetails.slug,
        coverUrl: gameDetails.coverUrl,
        summary: gameDetails.summary,
        releaseDate: gameDetails.releaseDate,
        totalRating: gameDetails.totalRating,
        totalRatingCount: gameDetails.totalRatingCount,
        esrbRating: gameDetails.esrbRating,
        esrbThumbnailUrl: gameDetails.esrbThumbnailUrl,
        esrbDescriptions: gameDetails.esrbDescriptions,
        developers: gameDetails.developers,
        publishers: gameDetails.publishers,
        igdbChecksum: gameDetails.igdbChecksum,
        gameType: gameDetails.gameType,
        genres: {
          set: relations.genreIds.map((genre) => ({id: genre}))
        },
        themes: {
          set: relations.themeIds.map((theme) => ({id: theme}))
        },
        platforms: {
          set: relations.platformIds.map((platform) => ({id: platform}))
        },
      },
    })
  },

  async syncWithIgdb () {
    let limit = 100;
    let offset = 0;
    let created = 0;
    let updated = 0;
    let totalProcessed = 0;

    let baseGameConnections: {id: number, baseGameId: number}[] = [];
    let relatedContentConnections: {id: number, relatedGameIds: number[]}[] = [];

    while (true) {
      console.log(`Fetching IGDB games ${offset}–${offset + limit}...`);

      const rawGames = await IgdbClient.getGames(limit, offset);
      if (rawGames.length === 0) break;

      const mappedGames = await Promise.all(rawGames.map(mapRawGameToDb));
      for (const game of mappedGames) {
        const existingGame = await GameService.findById(game.gameDetails.id);
        if (existingGame) {
          if (existingGame.igdbChecksum !== game.gameDetails.igdbChecksum) {
            await this.updateGameById(existingGame.id, game.gameDetails, game.relations);
            updated++;
          }
        }
        else {
          await this.createGame(game.gameDetails, game.relations);
          created++;
        }

        totalProcessed++;


        if (game.selfRelations.baseGameId) {
          baseGameConnections.push({
            id: game.gameDetails.id,
            baseGameId: game.selfRelations.baseGameId
          })
        }

        if (game.selfRelations.relatedContent) {
          relatedContentConnections.push({
            id: game.gameDetails.id,
            relatedGameIds: game.selfRelations.relatedContent
          })
        }
      }

      offset += limit;
    }

    const baseGameIdsToValidate = new Set(baseGameConnections.map(game => game.baseGameId));
    const existingBaseGames = await prisma.game.findMany({
      where: {id: {in: Array.from(baseGameIdsToValidate)}},
      select: {id: true}
    })
    const existingBaseGameIds = new Set(existingBaseGames.map(game => game.id));

    for (let i = 0; i < baseGameConnections.length; i++) {
      const gameId = baseGameConnections[i].id;
      const baseGameId = baseGameConnections[i].baseGameId;

      if (existingBaseGameIds.has(baseGameId)) {
        await prisma.game.update({
          where: {id: gameId},
          data: {
            baseGame: {
              connect: {
                id: baseGameId
              }
            }
          }
        })
      }
    }

    const relatedContentIdsToValidate = new Set(relatedContentConnections.flatMap(game => game.relatedGameIds))
    const existingRelatedContentGames = await prisma.game.findMany({
      where: {id: {in: Array.from(relatedContentIdsToValidate)}},
      select: {id: true}
    });
    const existingRelatedContentIds = new Set(existingRelatedContentGames.map(game => game.id));

    for (let i = 0; i < relatedContentConnections.length; i++) {
      const baseGameId = relatedContentConnections[i].id;
      const relatedGameIds = relatedContentConnections[i].relatedGameIds;

      const validGameIds = relatedGameIds.filter(id => existingRelatedContentIds.has(id))
      const connections = validGameIds.map(id => ({id}));

      if (validGameIds.length > 0) {
        await prisma.game.update({
          where: {id: baseGameId},
          data: {
            relatedContent: {
              connect: connections
            }
          }
        })
      }
    }

    console.log(`Game sync complete. Total processed: ${totalProcessed}`);
    return {updated, created, totalProcessed};
  }
}


async function mapRawGameToDb (rawGame: RawGame): Promise<{
  gameDetails: Prisma.GameCreateInput,
  relations: Relations,
  selfRelations: SelfRelations
}> {
  const coverUrl = generateCoverUrl(rawGame.cover);
  const releaseDate = normalizeReleaseDates(rawGame.release_dates);

  const {esrbRating, esrbThumbnailUrl, esrbDescriptions} = normalizeAgeRatings(rawGame.age_ratings);

  const involvedCompanies = rawGame.involved_companies;
  const {developers, publishers} = normalizeInvolvedCompanies(involvedCompanies);

  const validPlatforms = await filterValidPlatforms(rawGame.platforms);

  const relatedContent = new Set([...(rawGame.dlcs ?? []), ...(rawGame.expanded_games ?? []), ...(rawGame.expansions ?? []), ...(rawGame.standalone_expansions ?? [])]);
  return {
    gameDetails: {
      id: rawGame.id,
      name: rawGame.name,
      slug: rawGame.slug,
      coverUrl,
      summary: rawGame.summary ?? null,
      releaseDate: releaseDate,
      totalRating: rawGame.total_rating ?? null,
      totalRatingCount: rawGame.total_rating_count ?? null,
      esrbRating,
      esrbThumbnailUrl,
      esrbDescriptions,
      developers,
      publishers,
      igdbChecksum: rawGame.checksum,
      gameType: {
        connect: {id: rawGame.game_type}
      },
    },
    relations: {
      genreIds: rawGame.genres ?? [],
      themeIds: rawGame.themes ?? [],
      platformIds: validPlatforms,
    },
    selfRelations: {
      baseGameId: rawGame.parent_game ?? null,
      relatedContent: [...relatedContent.values()]
    }
  }
}


function normalizeReleaseDates (releaseDates: RawGame["release_dates"]): Date | null {
  if (!releaseDates) return null;

  let releaseDate;
  for (const date of releaseDates) {
    if (date.release_region === 2 || date.release_region === 8) {
      if (!releaseDate || date.date < releaseDate) releaseDate = date.date;
    }
  }
  if (!releaseDate) return null;

  return new Date(releaseDate * 1000);
}

function generateCoverUrl (coverInfo: RawGame["cover"]): string | null {
  if (!coverInfo) return null;

  const rawUrl = coverInfo.url;
  const coverUrl = rawUrl.replace('t_thumb', 't_720p')

  return `https:` + coverUrl;
}

async function filterValidPlatforms (platformIds: number[]): Promise<number[]> {
  if (!platformIds) return [];

  let validPlatforms: number[] = [];
  for (const id of platformIds) {
    const platform = await prisma.platform.findUnique({
      where: {id}
    })
    if (platform) validPlatforms.push(id);

  }
  return validPlatforms;
}

function normalizeInvolvedCompanies (involvedCompanies: RawGame["involved_companies"]): {
  developers: string[],
  publishers: string[]
} {
  let developers: string[] = [];
  let publishers: string[] = [];

  if (!involvedCompanies) return {developers, publishers};

  const developerIds = new Set;
  const publisherIds = new Set;

  for (const c of involvedCompanies) {
    const companyDetails = {
      id: c.company.id,
      name: c.company.name
    }

    if (c.developer && !developerIds.has(companyDetails.id)) {
      developers.push(companyDetails.name);
      developerIds.add(companyDetails.id)
    }
    if (c.publisher && !publisherIds.has(companyDetails.id)) {
      publishers.push(companyDetails.name);
      publisherIds.add(companyDetails.id)
    }
  }
  return {developers, publishers};
}

function normalizeAgeRatings (ageRatings: RawGame["age_ratings"]): Pick<GameDetailsDTO, "esrbRating" | "esrbThumbnailUrl" | "esrbDescriptions"> {
  let result: Pick<GameDetailsDTO, "esrbRating" | "esrbThumbnailUrl" | "esrbDescriptions"> = {
    esrbRating: '',
    esrbThumbnailUrl: '',
    esrbDescriptions: []
  };
  if (ageRatings && ageRatings.length === 0) return result;

  for (const ratingItem of ageRatings) {
    if (ratingItem.organization.id !== 1) continue;

    const mappedCategory = mapRatingCategory(ratingItem.rating_category);
    if (mappedCategory) {
      result["esrbRating"] = mappedCategory.esrbRating;
      result["esrbThumbnailUrl"] = mappedCategory.esrbThumbnailUrl;
    }

    result["esrbDescriptions"] = ratingItem.rating_content_descriptions
      ? ratingItem.rating_content_descriptions.map(d => d.description)
      : [];
  }
  return result;
}

function mapRatingCategory (category: {id: number, rating: string} | undefined): {
  esrbRating: string,
  esrbThumbnailUrl: string
} | null {
  if (!category) return null;

  switch (category.rating.toUpperCase()) {
    case 'EC': // legacy igdb response
    case 'E':
      return {
        esrbRating: 'Everyone',
        esrbThumbnailUrl: `${ENV.SERVER_URL}/public/images/esrb-rating-e.svg`
      };
    case 'T':
      return {
        esrbRating: 'Teen',
        esrbThumbnailUrl: `${ENV.SERVER_URL}/public/images/esrb-rating-t.svg`
      };
    case 'AO':
      return {
        esrbRating: 'Adults Only 18+',
        esrbThumbnailUrl: `${ENV.SERVER_URL}/public/images/esrb-rating-ao.svg`
      };
    case 'E10+':
      return {
        esrbRating: 'Everyone 10+',
        esrbThumbnailUrl: `${ENV.SERVER_URL}/public/images/esrb-rating-e10.svg`
      };
    case 'M':
      return {
        esrbRating: 'Mature 17+',
        esrbThumbnailUrl: `${ENV.SERVER_URL}/public/images/esrb-rating-m.svg`
      };
    case 'RP':
    default:
      return {
        esrbRating: 'Rating Pending',
        esrbThumbnailUrl: `${ENV.SERVER_URL}/public/images/esrb-rating-rp.svg`
      };
  }
}
