import { prisma } from "../db/client.js";
import { Platform } from "@prisma/client";
import { IgdbClient, RawPlatform } from "./igdbClient.js";
import { ProcessingCounts } from "../controllers/adminController.js";

type PlatformCreateInput = {
  id: number,
  name: string,
  abbreviation: string | null,
  igdbChecksum: string
}

type PlatformUpdateInput = {
  name: string,
  abbreviation: string | null,
  igdbChecksum: string
}

export const PlatformService = {
  async findById (id: number): Promise<Platform | null> {
    return prisma.platform.findUnique({
      where: {id}
    })
  },

  async create (data: PlatformCreateInput): Promise<Platform> {
    return prisma.platform.create({
      data
    })
  },

  async updateById (id: number, platformData: PlatformUpdateInput): Promise<Platform> {
    return prisma.platform.update({
      where: {id},
      data: {
        name: platformData.name,
        abbreviation: platformData.abbreviation,
        igdbChecksum: platformData.igdbChecksum
      }
    })
  },

  /**
   * Synchronizes local Platform table with IGDB.
   * Fetches all platforms from IGDB, then:
   *  • Inserts any missing platforms
   *  • Updates platforms where IGDB's checksum changed
   * Ensures local DB stays aligned with third party data.
   */
  async syncWithIgdb (): Promise<ProcessingCounts> {
    let updated = 0;
    let created = 0;
    let totalProcessed = 0;

    const rawPlatforms: RawPlatform[] = await IgdbClient.getPlatforms();
    const mappedPlatforms: PlatformCreateInput[] = rawPlatforms.map(mapIgdbResponseToDb);

    for (const platform of mappedPlatforms) {
      const existingPlatform: Platform | null = await this.findById(platform.id);

      if (existingPlatform) {
        if (existingPlatform.igdbChecksum !== platform.igdbChecksum) {
          await this.updateById(existingPlatform.id, platform);
          updated++;
        }
      }
      else {
        await this.create(platform);
        created++;
      }
      totalProcessed++;
    }

    return {updated, created, totalProcessed};
  },
}


function mapIgdbResponseToDb (igdbResponse: RawPlatform): PlatformCreateInput {
  return {
    id: igdbResponse.id,
    name: igdbResponse.name,
    abbreviation: igdbResponse.abbreviation ?? igdbResponse.name,
    igdbChecksum: igdbResponse.checksum
  };
}
