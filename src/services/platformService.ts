import { IgdbClient } from "./igdbClient.js";
import { prisma } from "../db/client.js";
import { Platform } from "@prisma/client";

type PlatformCreateInput = {
  id: number,
  name: string,
  abbreviation: string | null,
  igdb_checksum: string
}

type PlatformUpdateInput = {
  name: string,
  abbreviation: string | null,
  igdb_checksum: string
}

export const PlatformService = {
  async findById (id: number): Promise<Platform | null> {
    return prisma.platform.findUnique({
      where: { id }
    })
  },

  async createPlatform (data: PlatformCreateInput): Promise<Platform> {
    return prisma.platform.create({
      data
    })
  },

  async updatePlatformById (id: number, platformData: PlatformUpdateInput): Promise<Platform> {
    return prisma.platform.update({
      where: { id },
      data: {
        name: platformData.name,
        abbreviation: platformData.abbreviation,
        igdb_checksum: platformData.igdb_checksum
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
  async syncWithIgdb () {
    let updated = 0;
    let created = 0;
    let totalProcessed = 0;

    const rawPlatforms = await IgdbClient.getPlatforms();
    const mappedPlatforms = rawPlatforms.map(mapIgdbResponseToDb);

    for ( const platform of mappedPlatforms ) {
      const existingPlatform = await this.findById(platform.id);

      if ( existingPlatform ) {
        if ( existingPlatform.igdb_checksum !== platform.igdb_checksum ) {
          await this.updatePlatformById(existingPlatform.id, platform);
          updated++;
        }
      }
      else {
        await this.createPlatform(platform);
        created++;
      }
      totalProcessed++;
    }

    return { updated, created, totalProcessed };
  },
}


function mapIgdbResponseToDb (igdbResponse: any) {
  return {
    id: igdbResponse.id,
    name: igdbResponse.name,
    abbreviation: igdbResponse.abbreviation ?? null,
    igdb_checksum: igdbResponse.checksum
  };
}
