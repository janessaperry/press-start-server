import { prisma } from "../db/client.js";
import { IgdbClient, RawGame } from "./igdbClient.js";
import { Game, Prisma } from '@prisma/client';
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
  gameTypeId: number,
  igdbChecksum: string,
}

type UpdateGameInput = {
  name: string,
  slug: string,
  coverUrl: string,
  summary: string | null,
  releaseDate: Date | null,
  totalRating: number | null,
  totalRatingCount: number | null,
  gameTypeId: number,
  igdbChecksum: string
}

type GameOverview = {
  id: number,
  name: string,
  coverUrl: string,
  releaseDate: Date | null,
  slug: string,
  totalRating: number | null,
  consoles: {
    console: {
      id: number,
      abbreviation: string,
    }
  }[],
  gameType: {
    label: string
  },
}

type GameOverviewDTO = {
  id: number,
  name: string,
  coverUrl: string,
  releaseDate: string,
  slug: string,
  totalRating: string,
  consoles: {
    id: number,
    label: string,
  }[],
  gameType: string,
}

export const GameService = {
  async findById (id: number): Promise<Game | null> {
    return prisma.game.findUnique({
      where: {
        id
      }
    })
  },

  async findByName (query: string, select: Prisma.GameSelect): Promise<Game[] | null> {
    return prisma.game.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select,
      take: 10
    })
  },

  async findComingSoonGames () {
    let oneYearAhead = new Date();
    oneYearAhead.setMonth(oneYearAhead.getMonth() + 12);

    const data = await prisma.game.findMany({
      where: {
        releaseDate: {
          gte: new Date(Date.now()),
          lte: oneYearAhead
        }
      },
      orderBy: {
        releaseDate: 'asc'
      },
      select: {
        id: true,
        name: true,
        coverUrl: true,
        releaseDate: true,
        slug: true,
        totalRating: true,
        consoles: {
          select: {
            console: {
              select: {
                id: true,
                abbreviation: true,
              }
            }
          }
        },
        gameType: {
          select: {
            label: true
          }
        }
      },
      take: 18
    });

    return data.map(game => mapToGameOverviewDTO(game));
  },

  async findNewReleaseGames () {
    let sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const data = await prisma.game.findMany({
      where: {
        releaseDate: {
          gte: sixMonthsAgo,
          lte: new Date()
        }
      },
      orderBy: {
        releaseDate: 'desc'
      },
      select: {
        id: true,
        name: true,
        coverUrl: true,
        releaseDate: true,
        slug: true,
        totalRating: true,
        consoles: {
          select: {
            console: {
              select: {
                id: true,
                abbreviation: true,
              }
            }
          }
        },
        gameType: {
          select: {
            label: true,
          }
        }
      },
      take: 18
    })

    return data.map(game => mapToGameOverviewDTO(game));
  },

  async createGame (game: CreateGameInput): Promise<Game> {
    return prisma.game.create({
      data: game
    })
  },

  async createGameGenres (gameId: number, genreIds: number[]) {
    if (!genreIds) return;
    for (const genreId of genreIds) {
      await prisma.gameGenre.create({
        data: {
          gameId,
          genreId
        }
      })
    }
  },

  async createGameThemes (gameId: number, themeIds: number[]) {
    if (!themeIds) return;
    for (const themeId of themeIds) {
      await prisma.gameTheme.create({
        data: {
          gameId,
          themeId
        }
      })
    }
  },

  async createGameConsoles (gameId: number, consoleIds: number[]) {
    if (!consoleIds) return;

    for (const consoleId of consoleIds) {
      await prisma.gameConsole.create({
        data: {
          gameId,
          consoleId
        }
      })
    }
  },

  async updateGameById (id: number, gameDetails: UpdateGameInput): Promise<Game> {
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
        gameTypeId: gameDetails.gameTypeId,
        igdbChecksum: gameDetails.igdbChecksum
      }
    })
  },

  async updateGameGenres (gameId: number, genreIds: number[]) {
    if (!genreIds) return;

    await prisma.gameGenre.deleteMany({
      where: {gameId},
    })

    await this.createGameGenres(gameId, genreIds)
  },

  async updateGameThemes (gameId: number, themeIds: number[]) {
    if (!themeIds) return;

    await prisma.gameTheme.deleteMany({
      where: {gameId},
    })

    await this.createGameThemes(gameId, themeIds);
  },

  async updateGameConsoles (gameId: number, consoleIds: number[]) {
    if (!consoleIds) return;

    await prisma.gameConsole.deleteMany({
      where: {gameId}
    })

    await this.createGameConsoles(gameId, consoleIds)
  },

  async syncWithIgdb () {
    let limit = 100;
    let offset = 0;
    let created = 0;
    let updated = 0;
    let totalProcessed = 0;

    while (true) {
      console.log(`Fetching IGDB games ${offset}–${offset + limit}...`);

      const rawGames = await IgdbClient.getGames(limit, offset);
      if (rawGames.length === 0) break;
      const normalizedGames = await Promise.all(rawGames.map(normalizeResponse));

      for (const game of normalizedGames) {
        let existingGame = await this.findById(game.gameDetails.id);

        if (existingGame) {
          if (existingGame.igdbChecksum !== game.gameDetails.igdbChecksum) {
            await this.updateGameById(existingGame.id, game.gameDetails);
            if (game.gameGenres) await this.updateGameGenres(existingGame.id, game.gameGenres);
            if (game.gameThemes) await this.updateGameThemes(existingGame.id, game.gameThemes);
            if (game.gameConsoles) await this.updateGameConsoles(existingGame.id, game.gameConsoles);

            updated++;
          }
        }
        else {
          await this.createGame(game.gameDetails);
          if (game.gameGenres) await this.createGameGenres(game.gameDetails.id, game.gameGenres);
          if (game.gameThemes) await this.createGameThemes(game.gameDetails.id, game.gameThemes);
          if (game.gameConsoles) await this.createGameConsoles(game.gameDetails.id, game.gameConsoles);

          created++;
        }

        totalProcessed++;
      }

      offset += limit;
    }

    console.log(`Game sync complete. Total processed: ${totalProcessed}`);
    return {updated, created, totalProcessed};
  }
}

async function normalizeResponse (rawGame: RawGame) {
  const releaseDate = normalizeReleaseDates(rawGame.release_dates);
  const coverUrl = generateCoverUrl(rawGame.cover);
  const consoles = await filterValidConsoles(rawGame.platforms);

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
      gameTypeId: rawGame.game_type,
      igdbChecksum: rawGame.checksum,
    },
    gameGenres: rawGame.genres,
    gameThemes: rawGame.themes,
    gameConsoles: consoles
  }
}

function normalizeReleaseDates (releaseDates: RawGame["release_dates"]): Date | undefined {
  if (!releaseDates) return;

  let releaseDate;
  for (const date of releaseDates) {
    if (date.release_region === 2 || date.release_region === 8) {
      if (!releaseDate || date.date < releaseDate) releaseDate = date.date;
    }
  }
  if (!releaseDate) return;

  return new Date(releaseDate * 1000);
}

function generateCoverUrl (coverInfo: RawGame["cover"]): string {
  if (!coverInfo) return `${ENV.SERVER_URL}/public/images/no-cover.png`;

  const rawUrl = coverInfo.url;
  const coverUrl = rawUrl.replace('t_thumb', 't_cover_big')

  return `https:` + coverUrl;
}

async function filterValidConsoles (consoleIds: number[]): Promise<number[]> {
  if (!consoleIds) return [];

  let validConsoles: number[] = [];
  for (const id of consoleIds) {
    const consoleItem = await prisma.console.findUnique({
      where: {id}
    })
    if (consoleItem) validConsoles.push(id);

  }
  return validConsoles;
}

function mapToGameOverviewDTO (game: GameOverview): GameOverviewDTO {
  const releaseDate = game.releaseDate ? game.releaseDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) : "Release date unknown";
  const rating = game.totalRating ? String(game.totalRating) : 'n/a';
  const consoles = game.consoles.map(c => {
    return {
      id: c.console.id,
      label: c.console.abbreviation
    }
  });
  const gameType: string = game.gameType.label;

  return {
    id: game.id,
    name: game.name,
    coverUrl: game.coverUrl,
    releaseDate,
    slug: game.slug,
    totalRating: rating,
    consoles,
    gameType
  }
}
