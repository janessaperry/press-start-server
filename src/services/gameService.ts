import { prisma } from "../db/client.js";
import { IgdbClient, RawGame } from "./igdbClient.js";
import { Game } from '@prisma/client';
import { ENV } from "../config/env.js";

type CreateGameInput = {
  id: number
  name: string,
  coverUrl: string,
  slug: string,
  summary: string | null,
  releaseDate: Date | null,
  totalRating: number | null,
  totalRatingCount: number | null,
  igdbChecksum: string
}

type UpdateGameInput = {
  name: string,
  slug: string,
  coverUrl: string,
  summary: string | null,
  releaseDate: Date | null,
  totalRating: number | null,
  totalRatingCount: number | null,
  igdbChecksum: string
}

export const GameService = {
  async findById (id: number): Promise<Game | null> {
    return prisma.game.findUnique({
      where: {
        id
      }
    })
  },

  async createGame (game: CreateGameInput): Promise<Game> {
    return prisma.game.create({
      data: game
    })
  },

  async createGameGenres (gameId: number, genres: number[]) {
    if ( !genres ) return;
    for ( const genre of genres ) {
      await prisma.gameGenre.create({
        data: {
          gameId,
          genreId: genre
        }
      })
    }
  },

  async createGameThemes (gameId: number, themes: number[]) {
    if ( !themes ) return;
    for ( const theme of themes ) {
      await prisma.gameTheme.create({
        data: {
          gameId,
          themeId: theme
        }
      })
    }
  },

  async createGamePlatforms (gameId: number, platforms: number[]) {
    if ( !platforms ) return;
    for ( const platform of platforms ) {
      console.log(platform)
      await prisma.gamePlatform.create({
        data: {
          gameId,
          platformId: platform
        }
      })
    }
  },

  async updateGameById (id: number, gameDetails: UpdateGameInput): Promise<Game> {
    return prisma.game.update({
      where: { id },
      data: {
        name: gameDetails.name,
        slug: gameDetails.slug,
        coverUrl: gameDetails.coverUrl,
        summary: gameDetails.summary,
        releaseDate: gameDetails.releaseDate,
        totalRating: gameDetails.totalRating,
        totalRatingCount: gameDetails.totalRatingCount,
        igdbChecksum: gameDetails.igdbChecksum
      }
    })
  },

  async updateGameGenres (gameId: number, genres: number[]) {
    if ( !genres ) return;

    await prisma.gameGenre.deleteMany({
      where: { gameId },
    })

    await this.createGameGenres(gameId, genres)
  },

  async updateGameThemes (gameId: number, themes: number[]) {
    if ( !themes ) return;

    await prisma.gameTheme.deleteMany({
      where: { gameId },
    })

    await this.createGameThemes(gameId, themes);
  },

  async updateGamePlatforms (gameId: number, platforms: number[]) {
    if ( !platforms ) return;
    console.log("platforms", platforms)

    await prisma.gamePlatform.deleteMany({
      where: { gameId }
    })

    await this.createGamePlatforms(gameId, platforms)
  },

  async syncWithIgdb () {
    let limit = 100;
    let offset = 0;
    let created = 0;
    let updated = 0;
    let totalProcessed = 0;

    while ( true ) {
      console.log(`Fetching IGDB games ${offset}–${offset + limit}...`);

      const rawGames = await IgdbClient.getGames(limit, offset);
      if ( rawGames.length === 0 ) break;
      const normalizedGames = await Promise.all(rawGames.map(normalizeResponse));

      for ( const game of normalizedGames ) {
        let existingGame = await this.findById(game.gameDetails.id);

        if ( existingGame ) {
          if ( existingGame.igdbChecksum !== game.gameDetails.igdbChecksum ) {
            await this.updateGameById(existingGame.id, game.gameDetails);
            if ( game.gameGenres ) await this.updateGameGenres(existingGame.id, game.gameGenres);
            if ( game.gameThemes ) await this.updateGameThemes(existingGame.id, game.gameThemes);
            if ( game.gamePlatforms ) await this.updateGamePlatforms(existingGame.id, game.gamePlatforms);

            updated++;
          }
        }
        else {
          await this.createGame(game.gameDetails);
          if ( game.gameGenres ) await this.createGameGenres(game.gameDetails.id, game.gameGenres);
          if ( game.gameThemes ) await this.createGameThemes(game.gameDetails.id, game.gameThemes);
          if ( game.gamePlatforms ) await this.createGamePlatforms(game.gameDetails.id, game.gamePlatforms);

          created++;
        }

        totalProcessed++;
      }

      offset += limit;
    }

    console.log(`Game sync complete. Total processed: ${totalProcessed}`);
    return { updated, created, totalProcessed };
  }
}

async function normalizeResponse (rawGame: RawGame) {
  const releaseDate = normalizeReleaseDates(rawGame.release_dates);
  const coverUrl = generateCoverUrl(rawGame.cover);
  const platforms = await filterValidPlatforms(rawGame.platforms);
  
  return {
    gameDetails: {
      id: rawGame.id,
      name: rawGame.name,
      slug: rawGame.slug,
      coverUrl: coverUrl,
      summary: rawGame.summary,
      releaseDate: releaseDate,
      totalRating: rawGame.total_rating && Math.round(rawGame.total_rating),
      totalRatingCount: rawGame.total_rating_count,
      igdbChecksum: rawGame.checksum
    },
    gameGenres: rawGame.genres,
    gameThemes: rawGame.themes,
    gamePlatforms: platforms
  }
}


function normalizeReleaseDates (releaseDates: RawGame["release_dates"]) {
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

function generateCoverUrl (coverInfo: RawGame["cover"]) {
  if ( !coverInfo ) return `${ENV.SERVER_URL}/public/images/no-cover.png`;

  const rawUrl = coverInfo.url;
  const coverUrl = rawUrl.replace('t_thumb', 't_cover_big')

  return `https:` + coverUrl;
}

async function filterValidPlatforms (platformsIds: number[]): Promise<number[]> {
  if ( !platformsIds ) return [];

  let validPlatforms: number[] = [];
  for ( const id of platformsIds ) {
    const platform = await prisma.platform.findUnique({
      where: { id }
    })
    if ( platform ) validPlatforms.push(id);

  }
  return validPlatforms;
}

