import { ProcessingCounts } from "../controllers/adminController.js";
import { prisma } from "../db/client.js";
import { Genre, Prisma } from "../generated/prisma/client";
import { IgdbClient } from "../integrations/igdbClient.js";
import { RawGenre } from "../integrations/igdbClient.types.js";
import { logger } from "../errors/logger.js";

export const GenreService = {
  async findAll () {
    return prisma.genre.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    })
  },

  async findById (id: number): Promise<Genre | null> {
    return prisma.genre.findUnique({
      where: { id }
    })
  },

  async findByUserId (userId: number) {
    const userLibrary = await prisma.userGame.findMany({
      where: { userId },
      select: {
        gameDetails: {
          select: {
            genres: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    const allGenres = userLibrary.flatMap(game => {
      return game.gameDetails.genres
    })

    const uniqueGenreIds = new Set();
    const libraryGenres = [];
    for (const genre of allGenres) {
      if (!uniqueGenreIds.has(genre.id)) {
        libraryGenres.push(genre);
        uniqueGenreIds.add(genre.id);
      }
    }

    libraryGenres.sort((a, b) => a.name.localeCompare(b.name));
    return libraryGenres;
  },

  async create (genre: Prisma.GenreCreateInput): Promise<Genre> {
    return prisma.genre.create({
      data: genre
    })
  },

  async updateById (id: number, data: Prisma.GenreUpdateInput): Promise<Genre> {
    return prisma.genre.update({
      where: { id },
      data: {
        name: data.name,
        igdbChecksum: data.igdbChecksum
      }
    })
  },

  async syncWithIgdb (): Promise<ProcessingCounts> {
    let created = 0;
    let updated = 0;
    let totalProcessed = 0;

    const rawGenres = await IgdbClient.getGenres();
    const mappedGenres = rawGenres.map(mapIgdbResponseToDb);

    for (const genre of mappedGenres) {
      let existingGenre = await this.findById(genre.id);
      if (existingGenre) {
        if (existingGenre.igdbChecksum !== genre.igdbChecksum) {
          await this.updateById(existingGenre.id, genre);
          updated++;
        }
      }
      else {
        await this.create(genre);
        created++;
      }

      totalProcessed++;
    }

    logger.info(`Genre sync complete. Total processed: ${totalProcessed}`)
    return { updated, created, totalProcessed }
  }
}

function mapIgdbResponseToDb (igdbResponse: RawGenre): Prisma.GenreCreateInput {
  return {
    id: igdbResponse.id,
    name: igdbResponse.name,
    igdbChecksum: igdbResponse.checksum
  };
}
