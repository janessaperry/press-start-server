import { prisma } from "../db/client.js";
import { Genre, Prisma } from "../generated/prisma/client";
import { IgdbClient, RawGenre } from "./igdbClient.js";
import { ProcessingCounts } from "../controllers/adminController.js";


export const GenreService = {
  async findById (id: number): Promise<Genre | null> {
    return prisma.genre.findUnique({
      where: {id}
    })
  },

  async create (genre: Prisma.GenreCreateInput): Promise<Genre> {
    return prisma.genre.create({
      data: genre
    })
  },

  async updateById (id: number, data: Prisma.GenreUpdateInput): Promise<Genre> {
    return prisma.genre.update({
      where: {id},
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

    console.log(`Genre sync complete. Total processed: ${totalProcessed}`)
    return {updated, created, totalProcessed}
  }
}

function mapIgdbResponseToDb (igdbResponse: RawGenre): Prisma.GenreCreateInput {
  return {
    id: igdbResponse.id,
    name: igdbResponse.name,
    igdbChecksum: igdbResponse.checksum
  };
}
