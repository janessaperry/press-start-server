import { ProcessingCounts } from "../controllers/adminController";
import { IgdbClient, RawFranchise } from "./igdbClient";
import { Franchise, Prisma } from "../generated/prisma/client";
import { prisma } from "../db/client";

export const FranchiseService = {
  async findById (id: number): Promise<Franchise | null> {
    return prisma.franchise.findUnique({
      where: {id}
    });
  },

  async create (data: Prisma.FranchiseCreateInput): Promise<Franchise> {
    return prisma.franchise.create({
      data
    });
  },

  async updateById (id: number, data: Prisma.FranchiseUpdateInput): Promise<Franchise> {
    return prisma.franchise.update({
      where: {id},
      data
    });
  },

  async syncWithIgdb (): Promise<ProcessingCounts> {
    let created = 0;
    let updated = 0;
    let totalProcessed = 0;

    let limit = 500;
    let offset = 0;

    while (true) {
      const rawFranchises = await IgdbClient.getFranchises(limit, offset);
      if (rawFranchises.length === 0) break;

      const mappedFranchises = rawFranchises.map(mapIgdbResponseToDb);

      for (const franchise of mappedFranchises) {
        const existingFranchise = await this.findById(franchise.id);

        if (existingFranchise) {
          if (existingFranchise.igdbChecksum === franchise.igdbChecksum) {
            await this.updateById(franchise.id, franchise);
            updated++;
          }
        }
        else {
          await this.create(franchise);
          created++;
        }

        totalProcessed++;
      }

      offset += limit;
    }

    console.log(`Franchise sync complete. Total processed: ${totalProcessed}`)
    return {created, updated, totalProcessed};
  }
}

function mapIgdbResponseToDb (igdbResponse: RawFranchise): Prisma.FranchiseCreateInput {
  return {
    id: igdbResponse.id,
    name: igdbResponse.name,
    igdbChecksum: igdbResponse.checksum
  }
}