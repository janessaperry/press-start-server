import { prisma } from "../db/client.js";
import { IgdbClient } from "./igdbClient.js";
import { Theme } from "@prisma/client";

type ThemeCreateInput = {
  id: number,
  name: string,
  igdb_checksum: string
}

type ThemeUpdateInput = {
  name: string,
  igdb_checksum: string
}

export const ThemeService = {
  async findById (id: number): Promise<Theme | null> {
    return prisma.theme.findUnique({
      where: { id }
    })
  },

  async createTheme (theme: ThemeCreateInput): Promise<Theme> {
    return prisma.theme.create({
      data: theme
    })
  },

  async updateThemeById (themeId: number, theme: ThemeUpdateInput): Promise<Theme> {
    return prisma.theme.update({
      where: {
        id: themeId
      },
      data: {
        name: theme.name,
        igdb_checksum: theme.igdb_checksum
      }
    })
  },

  async syncWithIgdb () {
    let created = 0;
    let updated = 0;
    let totalProcessed = 0;

    const rawThemes = await IgdbClient.getThemes();
    const mappedThemes = rawThemes.map(mapIgdbResponseToDb);

    for ( const theme of mappedThemes ) {
      let existingTheme = await this.findById(theme.id);
      if ( existingTheme ) {
        if ( existingTheme.igdb_checksum !== theme.igdb_checksum ) {
          await this.updateThemeById(existingTheme.id, theme);
          updated++;
        }
      }
      else {
        await this.createTheme(theme);
        created++;
      }

      totalProcessed++;
    }

    console.log(`Theme sync complete. Total processed: ${totalProcessed}`)
    return { updated, created, totalProcessed }
  }
}

const mapIgdbResponseToDb = (igdbResponse: any) => {
  return {
    id: igdbResponse.id,
    name: igdbResponse.name,
    igdb_checksum: igdbResponse.checksum,
  }
}