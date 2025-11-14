import { prisma } from "../db/client.js";
import { IgdbClient } from "./igdbClient.js";
import { Game } from '@prisma/client'

export const GameService = {
  async findById (id: number): Promise<Game | null> {
    return prisma.game.findUnique({
      where: {
        id
      }
    })
  },

  async createGame (game: Game): Promise<void> {
    await prisma.game.create({
      data: game
    })
  },

  async createGameGenres (gameId: number, genres: number[]) {
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

  async updateGame (game: Game): Promise<void> {
    await prisma.game.update({
      where: {
        id: game.id
      },
      data: game
    })
  },

  async updateGameGenres (gameId: number, genres: number[]) {
    for ( const genre of genres ) {
      await prisma.gameGenre.update({
        where: {
          gameId_genreId: {
            gameId,
            genreId: genre
          },
        },
        data: {
          gameId,
          genreId: genre
        }
      })
    }
  },

  async updateGameThemes (gameId: number, themes: number[]) {
    if ( !themes ) return;

    for ( const theme of themes ) {
      await prisma.gameTheme.update({
        where: {
          gameId_themeId: {
            gameId,
            themeId: theme
          }
        },
        data: {
          gameId,
          themeId: theme
        }
      })
    }

  },

  async syncWithIgdb () {
    let limit = 100;
    let offset = 0;
    let created = 0;
    let updated = 0;
    let totalProcessed = 0;

    while ( true ) {
      console.log(`Fetching IGDB games ${offset}–${offset + limit}...`);

      const gameResponse = await IgdbClient.getGames(limit, offset);
      if ( gameResponse.length === 0 ) break;

      for ( const game of gameResponse ) {
        let existingGame = await this.findById(game.gameDetails.id);
        if ( existingGame ) {
          if ( existingGame.checksum !== game.gameDetails.checksum ) {
            await this.updateGame(game.gameDetails);
            if ( game.gameGenres ) await this.updateGameGenres(game.gameDetails.id, game.gameGenres);
            if ( game.gameThemes ) await this.updateGameThemes(game.gameDetails.id, game.gameThemes);
            updated++
          }
        }
        else {
          await this.createGame(game.gameDetails);
          if ( game.gameGenres ) await this.createGameGenres(game.gameDetails.id, game.gameGenres);
          if ( game.gameThemes ) await this.createGameThemes(game.gameDetails.id, game.gameThemes);

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