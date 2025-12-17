import { prisma } from "../db/client.js";
import { Prisma, Theme } from "../generated/prisma/client"
import { IgdbClient, RawTheme } from "./igdbClient.js";
import { ProcessingCounts } from "../controllers/adminController.js";


export const ThemeService = {
  async findById (id: number): Promise<Theme | null> {
    return prisma.theme.findUnique({
      where: {id}
    })
  },

  async create (theme: Prisma.ThemeCreateInput): Promise<Theme> {
    return prisma.theme.create({
      data: theme
    })
  },

  async updateById (themeId: number, theme: Prisma.ThemeUpdateInput): Promise<Theme> {
    return prisma.theme.update({
      where: {
        id: themeId
      },
      data: {
        name: theme.name,
        igdbChecksum: theme.igdbChecksum
      }
    })
  },

  async syncWithIgdb (): Promise<ProcessingCounts> {
    let created = 0;
    let updated = 0;
    let totalProcessed = 0;

    const rawThemes: RawTheme[] = await IgdbClient.getThemes();
    const mappedThemes: Prisma.ThemeCreateInput[] = rawThemes.map(mapIgdbResponseToDb);

    for (const theme of mappedThemes) {
      let existingTheme: Theme | null = await this.findById(theme.id);
      if (existingTheme) {
        if (existingTheme.igdbChecksum !== theme.igdbChecksum) {
          await this.updateById(existingTheme.id, theme);
          updated++;
        }
      }
      else {
        await this.create(theme);
        created++;
      }

      totalProcessed++;
    }

    console.log(`Theme sync complete. Total processed: ${totalProcessed}`)
    return {updated, created, totalProcessed}
  }
}

function mapIgdbResponseToDb (igdbResponse: RawTheme): Prisma.ThemeCreateInput {
  return {
    id: igdbResponse.id,
    name: igdbResponse.name,
    igdbChecksum: igdbResponse.checksum,
  }
}