import { prisma } from "../db/client.js";
import { IgdbClient } from "./igdbClient.js";
import { Genre } from "@prisma/client";

export const GenreService = {
  async findById (id: number): Promise<Genre | null> {
    return prisma.genre.findUnique({
      where: { id }
    })
  },

  async createGenre (genre: Genre): Promise<void> {
    await prisma.genre.create({
      data: genre
    })
  },

  async updateGenre (genre: Genre): Promise<void> {
    await prisma.genre.update({
      where: {
        id: genre.id
      },
      data: genre
    })
  },

  async syncWithIgdb () {
    let created = 0;
    let updated = 0;
    let totalProcessed = 0;
    const genres = await IgdbClient.getGenres();

    for ( const genre of genres ) {
      let existingGenre = await this.findById(genre.id);
      if ( existingGenre ) {
        if ( existingGenre.name !== genre.name ) {
          await this.updateGenre(existingGenre);
          updated++;
        }
      }
      else {
        await this.createGenre(genre);
        created++;
      }

      totalProcessed++;
    }

    console.log(`Genre sync complete. Total processed: ${totalProcessed}`)
    return { updated, created, totalProcessed }
  }
}