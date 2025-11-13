import { prisma } from "../db/client.js";
import { Game } from '@prisma/client'
import { IgdbClient } from "./igdbClient.js";


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

  async updateGame (game: Game): Promise<void> {
    await prisma.game.update({
      where: {
        id: game.id
      },
      data: game
    })
  },

  async syncWithIgdb () {
    let limit = 500;
    let offset = 0;
    let created = 0;
    let updated = 0;
    let totalProcessed = 0;

    while ( true ) {
      console.log(`Fetching IGDB games ${offset}–${offset + limit}...`);
      const games = await IgdbClient.getAll(limit, offset);
      if ( games.length === 0 ) break;

      for ( const game of games ) {
        let existingGame = await this.findById(game.id);
        if ( existingGame ) {
          if ( existingGame.checksum !== game.checksum ) {
            updated++
            await this.updateGame(game);
          }
        }
        else {
          created++;
          await this.createGame(game);
        }

        totalProcessed++;
      }

      offset += limit;
    }

    console.log(`Sync complete. Total processed: ${totalProcessed}`);
    return { updated, created, totalProcessed };
  }
}