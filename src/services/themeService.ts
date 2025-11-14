import { prisma } from "../db/client.js";
import { IgdbClient } from "./igdbClient.js";
import { Theme } from "@prisma/client";

export const ThemeService = {
  async findById (id: number): Promise<Theme | null> {
    return prisma.theme.findUnique({
      where: { id }
    })
  },

  async createTheme (theme: Theme): Promise<void> {
    await prisma.theme.create({
      data: theme
    })
  },

  async updateTheme (theme: Theme): Promise<void> {
    await prisma.theme.update({
      where: {
        id: theme.id
      },
      data: theme
    })
  },

  async syncWithIgdb () {
    let created = 0;
    let updated = 0;
    let totalProcessed = 0;
    const themes = await IgdbClient.getThemes();

    for ( const theme of themes ) {
      let existingTheme = await this.findById(theme.id);
      if ( existingTheme ) {
        if ( existingTheme.name !== theme.name ) {
          await this.updateTheme(existingTheme);
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