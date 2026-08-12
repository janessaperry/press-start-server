import { ProcessingCounts } from "../controllers/adminController.js";
import { prisma } from "../db/client.js";
import { Platform, PlatformFamily, Prisma } from "../generated/prisma/client.js";
import { IgdbClient } from "../integrations/igdbClient.js";
import { RawPlatform, RawPlatformFamily } from "../integrations/igdbClient.types.js";

export const PlatformService = {
  async findAllPlatformFamily () {
    return prisma.platformFamily.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  },

  async findPlatformFamilyById (id: number): Promise<PlatformFamily | null> {
    return prisma.platformFamily.findUnique({
      where: {id}
    })
  },

  async createPlatformFamily (data: Prisma.PlatformFamilyCreateInput): Promise<PlatformFamily> {
    return prisma.platformFamily.create({
      data
    })
  },

  async updatePlatformFamily (id: number, data: Prisma.PlatformFamilyUpdateInput): Promise<PlatformFamily> {
    return prisma.platformFamily.update({
      where: {id},
      data: {
        name: data.name,
        slug: data.slug,
        igdbChecksum: data.igdbChecksum
      }
    })
  },

  async findAllPlatform () {
    return prisma.platform.findMany({
      select: {
        id: true,
        abbreviation: true
      },
      orderBy: {
        abbreviation: 'asc'
      }
    })
  },

  async findPlatformById (id: number): Promise<Platform | null> {
    return prisma.platform.findUnique({
      where: {id}
    })
  },

  async createPlatform (data: Prisma.PlatformCreateInput): Promise<Platform> {
    return prisma.platform.create({
      data
    })
  },

  async updatePlatformById (id: number, data: Prisma.PlatformUpdateInput): Promise<Platform> {
    return prisma.platform.update({
      where: {id},
      data: {
        name: data.name,
        abbreviation: data.abbreviation,
        igdbChecksum: data.igdbChecksum,
      }
    })
  },

  /**
   * Synchronizes local Platform Family and Platform tables with IGDB.
   *
   * Process:
   * 1. Fetches all platforms families from IGDB
   * 2. Creates new families or updates existing ones (if checksum changed)
   * 3. Fetches all platforms from IGDB
   * 4. Creates new platforms or updates existing ones (if igdbChecksum changed)
   * 5. Connect each platform to its platform families via foreign key
   *
   * Special handling:
   * - Renames IGDB's Linux family (ID 4) to "PC" for grouping
   * - Assigns PC and Mac platforms to the PC family
   */
  async syncWithIgdb (): Promise<{platformFamilyCounts: ProcessingCounts, platformCounts: ProcessingCounts}> {
    let platformFamilyCounts = {
      updated: 0,
      created: 0,
      totalProcessed: 0
    }
    let platformCounts = {
      updated: 0,
      created: 0,
      totalProcessed: 0
    }

    const rawPlatformsFamilies = await IgdbClient.getPlatformFamilies();
    const mappedPlatformFamilies = rawPlatformsFamilies.map(mapRawPlatformFamilytoDb);

    for (const platformFamily of mappedPlatformFamilies) {
      const existingPlatformFamily = await this.findPlatformFamilyById(platformFamily.id);

      if (existingPlatformFamily) {
        if (existingPlatformFamily.igdbChecksum !== platformFamily.igdbChecksum) {
          await this.updatePlatformFamily(existingPlatformFamily.id, platformFamily);
          platformFamilyCounts.updated++;
        }
      }
      else {
        await this.createPlatformFamily(platformFamily);
        platformFamilyCounts.created++
      }
      platformFamilyCounts.totalProcessed++;
    }

    const rawPlatforms = await IgdbClient.getPlatforms();
    const mappedPlatforms = rawPlatforms.map(mapIgdbResponseToDb);

    for (const platform of mappedPlatforms) {
      const existingPlatform: Platform | null = await this.findPlatformById(platform.id);

      if (existingPlatform) {
        if (existingPlatform.igdbChecksum !== platform.igdbChecksum) {
          await this.updatePlatformById(existingPlatform.id, platform);
          platformCounts.updated++;
        }
      }
      else {
        await this.createPlatform(platform);
        platformCounts.created++;
      }
      platformCounts.totalProcessed++;
    }

    return {platformFamilyCounts, platformCounts};
  },
}

/**
 * Maps IGDB platform family data to Prisma PlatformFamilyCreateInput format.
 *
 * Note:
 * - Rename Linux (ID 4) platform family name and slug
 */
function mapRawPlatformFamilytoDb (igdbResponse: RawPlatformFamily): Prisma.PlatformFamilyCreateInput {
  return {
    id: igdbResponse.id,
    name: igdbResponse.id === 4 ? "PC" : igdbResponse.name,
    slug: igdbResponse.id === 4 ? "pc" : igdbResponse.slug,
    igdbChecksum: igdbResponse.checksum
  }
}

/**
 * Maps IGDB platform data to Prisma PlatformCreateInput format.
 *
 * Note:
 * - PC (ID 6) → PC family (4)
 * - Mac (ID 14) → PC family (4)
 * - All other platforms use IGDB's platform_family field
 */
function mapIgdbResponseToDb (igdbResponse: RawPlatform): Prisma.PlatformCreateInput {
  const platformFamilyOverrides: {[key: number]: number} = {
    6: 4,
    14: 4,
  };

  let platformFamilyId: number = platformFamilyOverrides[igdbResponse.id] ? platformFamilyOverrides[igdbResponse.id] : igdbResponse.platform_family;
  return {
    id: igdbResponse.id,
    name: igdbResponse.name,
    abbreviation: igdbResponse.abbreviation ?? igdbResponse.name,
    igdbChecksum: igdbResponse.checksum,
    platformFamily: {
      connect: {id: platformFamilyId}
    }
  };
}


