import { ProcessingCounts } from "../controllers/adminController.js";
import { prisma } from "../db/client.js";
import { Collection, Prisma } from "../generated/prisma/client.js";
import { IgdbClient } from "../integrations/igdbClient.js";
import { RawCollection } from "../integrations/igdbClient.types.js";

export const CollectionService = {
  async findById (id: number): Promise<Collection | null> {
    return prisma.collection.findUnique({
      where: {id}
    })
  },

  async create (collection: Prisma.CollectionCreateInput): Promise<Collection> {
    return prisma.collection.create({
      data: collection
    });
  },

  async updateById (id: number, collection: Prisma.CollectionUpdateInput): Promise<Collection> {
    return prisma.collection.update({
      where: {id},
      data: {
        name: collection.name,
        igdbChecksum: collection.igdbChecksum
      }
    });
  },

  async syncWithIgdb (): Promise<ProcessingCounts> {
    let created = 0;
    let updated = 0;
    let totalProcessed = 0;

    let limit = 500;
    let offset = 0;

    while (true) {
      const rawCollections = await IgdbClient.getCollections(limit, offset);
      if (rawCollections.length === 0) break;

      const mappedCollections = rawCollections.map(collection => mapIgdbResponseToDb(collection))

      for (const collection of mappedCollections) {
        const existingCollection = await this.findById(collection.id);
        if (existingCollection) {
          if (existingCollection.igdbChecksum !== collection.igdbChecksum) {
            await this.updateById(existingCollection.id, collection);
            updated++;
          }
        }
        else {
          await this.create(collection);
          created++;
        }

        totalProcessed++;
      }

      offset += limit;
    }

    console.log(`Collection sync complete. Total processed: ${totalProcessed}`)
    return {created, updated, totalProcessed}
  }
}

function mapIgdbResponseToDb (igdbResponse: RawCollection): Prisma.CollectionCreateInput {
  return {
    id: igdbResponse.id,
    name: igdbResponse.name,
    igdbChecksum: igdbResponse.checksum
  }
}