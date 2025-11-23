import { prisma } from "../db/client.js";
import { IgdbClient } from "./igdbClient.js";
import { Genre } from "@prisma/client";

type GenreCreateInput = {
  id: number,
  name: string,
  igdbChecksum: string
}

type GenreUpdateInput = {
  name: string,
  igdbChecksum: string
}

export const GenreService = {
  async findById (id: number): Promise<Genre | null> {
    return prisma.genre.findUnique({
      where: { id }
    })
  },

  async createGenre (genre: GenreCreateInput): Promise<Genre> {
    return prisma.genre.create({
      data: genre
    })
  },

  async updateGenreById (id: number, genreData: GenreUpdateInput): Promise<Genre> {
    return prisma.genre.update({
      where: { id },
      data: {
        name: genreData.name,
        igdbChecksum: genreData.igdbChecksum
      }
    })
  },

  async syncWithIgdb () {
    let created = 0;
    let updated = 0;
    let totalProcessed = 0;

    const rawGenres = await IgdbClient.getGenres();
    const mappedGenres = rawGenres.map(mapIgdbResponseToDb);

    for ( const genre of mappedGenres ) {
      let existingGenre = await this.findById(genre.id);
      if ( existingGenre ) {
        if ( existingGenre.igdbChecksum !== genre.igdbChecksum ) {
          await this.updateGenreById(existingGenre.id, genre);
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

function mapIgdbResponseToDb (igdbResponse: any) {
  return {
    id: igdbResponse.id,
    name: igdbResponse.name,
    igdbChecksum: igdbResponse.checksum
  };
}
