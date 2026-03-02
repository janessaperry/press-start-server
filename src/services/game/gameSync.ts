import { prisma } from "../../db/client.js";
import { Game, Prisma } from "../../generated/prisma/client.js";
import { IgdbClient, RawGame } from "../igdbClient.js";
import { GameDetailsDTO, GameService } from "./gameService";

type Relations = {
  genreIds: number[],
  themeIds: number[],
  platformIds: number[],
  collectionIds: number[]
  franchiseIds: number[]
}

type SelfRelations = {
  baseGameId: number | null,
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
        collections: {
          connect: relations.collectionIds.map((id) => ({id}))
        },
        franchises: {
          connect: relations.franchiseIds.map((id) => ({id}))
        }
      }
    })
  },

  async updateGameById (id: number, gameDetails: Prisma.GameUpdateInput, relations: Relations): Promise<Game> {
    return prisma.game.update({
      where: {id},
      data: {
        name: gameDetails.name,
        slug: gameDetails.slug,
        coverId: gameDetails.coverId,
        summary: gameDetails.summary,
        releaseDate: gameDetails.releaseDate,
        totalRating: gameDetails.totalRating,
        totalRatingCount: gameDetails.totalRatingCount,
        esrbRating: gameDetails.esrbRating,
        esrbThumbnailId: gameDetails.esrbThumbnailId,
        esrbDescriptions: gameDetails.esrbDescriptions,
        developers: gameDetails.developers,
        publishers: gameDetails.publishers,
        screenshotIds: gameDetails.screenshotIds,
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
        collections: {
          set: relations.collectionIds.map((id) => ({id}))
        },
        franchises: {
          set: relations.franchiseIds.map((id) => ({id}))
        }
      },
    })
  },

  async syncWithIgdb () {
    let limit = 500;
    let offset = 0;
    let created = 0;
    let updated = 0;
    let totalProcessed = 0;

    let baseGameConnections: {id: number, baseGameId: number}[] = [];

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

        // collect relationship data during sync so we can check if the games exist in the db before connecting records
        if (game.selfRelations.baseGameId) {
          baseGameConnections.push({
            id: game.gameDetails.id,
            baseGameId: game.selfRelations.baseGameId
          })
        }
      }

      offset += limit;
    }

    // get all unique base game ids that need validation, so we only query the db once
    const baseGameIdsToValidate = new Set(baseGameConnections.map(game => game.baseGameId));
    const existingBaseGames = await prisma.game.findMany({
      where: {id: {in: Array.from(baseGameIdsToValidate)}},
      select: {id: true}
    })
    const existingBaseGameIds = new Set(existingBaseGames.map(game => game.id));

    // loop over original connections so we know which game should connect to which base game
    for (let i = 0; i < baseGameConnections.length; i++) {
      const gameId = baseGameConnections[i].id;
      const baseGameId = baseGameConnections[i].baseGameId;

      // only connect if the base game exists
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

    console.log(`Game sync complete. Total processed: ${totalProcessed}`);
    return {updated, created, totalProcessed};
  }
}


async function mapRawGameToDb (rawGame: RawGame): Promise<{
  gameDetails: Prisma.GameCreateInput,
  relations: Relations,
  selfRelations: SelfRelations
}> {
  const releaseDate = normalizeReleaseDates(rawGame.release_dates);

  const {esrbRating, esrbThumbnailId, esrbDescriptions} = normalizeAgeRatings(rawGame.age_ratings);

  const involvedCompanies = rawGame.involved_companies;
  const {developers, publishers} = normalizeInvolvedCompanies(involvedCompanies);

  const validPlatforms = await filterValidPlatforms(rawGame.platforms);
  const screenshotIds = rawGame.screenshots ? rawGame.screenshots.map(item => item.image_id) : [];

  return {
    gameDetails: {
      id: rawGame.id,
      name: rawGame.name,
      slug: rawGame.slug,
      coverId: rawGame.cover ? rawGame.cover.image_id : null,
      summary: rawGame.summary ?? null,
      releaseDate: releaseDate,
      totalRating: rawGame.total_rating ?? null,
      totalRatingCount: rawGame.total_rating_count ?? null,
      esrbRating,
      esrbThumbnailId,
      esrbDescriptions,
      developers,
      publishers,
      screenshotIds,
      igdbChecksum: rawGame.checksum,
      gameType: {
        connect: {id: rawGame.game_type}
      },
    },
    relations: {
      genreIds: rawGame.genres ?? [],
      themeIds: rawGame.themes ?? [],
      platformIds: validPlatforms,
      collectionIds: rawGame.collections ?? [],
      franchiseIds: rawGame.franchises ?? [],
    },
    selfRelations: {
      baseGameId: rawGame.parent_game ?? null,
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

function normalizeAgeRatings (ageRatings: RawGame["age_ratings"]): Pick<GameDetailsDTO, "esrbRating" | "esrbThumbnailId" | "esrbDescriptions"> {
  let result: Pick<GameDetailsDTO, "esrbRating" | "esrbThumbnailId" | "esrbDescriptions"> = {
    esrbRating: '',
    esrbThumbnailId: '',
    esrbDescriptions: []
  };
  if (ageRatings && ageRatings.length === 0) return result;

  for (const ratingItem of ageRatings) {
    if (ratingItem.organization.id !== 1) continue;

    const mappedCategory = mapRatingCategory(ratingItem.rating_category);
    if (mappedCategory) {
      result["esrbRating"] = mappedCategory.esrbRating;
      result["esrbThumbnailId"] = mappedCategory.esrbThumbnailId;
    }

    result["esrbDescriptions"] = ratingItem.rating_content_descriptions
      ? ratingItem.rating_content_descriptions.map(d => d.description)
      : [];
  }
  return result;
}

function mapRatingCategory (category: {id: number, rating: string} | undefined): {
  esrbRating: string,
  esrbThumbnailId: string
} | null {
  if (!category) return null;

  switch (category.rating.toUpperCase()) {
    case 'EC': // legacy igdb response
    case 'E':
      return {
        esrbRating: 'Everyone',
        esrbThumbnailId: "esrb-rating-e"
      };
    case 'T':
      return {
        esrbRating: 'Teen',
        esrbThumbnailId: "esrb-rating-t"
      };
    case 'AO':
      return {
        esrbRating: 'Adults Only 18+',
        esrbThumbnailId: "esrb-rating-ao"
      };
    case 'E10+':
      return {
        esrbRating: 'Everyone 10+',
        esrbThumbnailId: "esrb-rating-e10"
      };
    case 'M':
      return {
        esrbRating: 'Mature 17+',
        esrbThumbnailId: "esrb-rating-m"
      };
    case 'RP':
    default:
      return {
        esrbRating: 'Rating Pending',
        esrbThumbnailId: "esrb-rating-rp"
      };
  }
}
