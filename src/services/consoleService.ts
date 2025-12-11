import { prisma } from "../db/client.js";
import { Console } from "@prisma/client";
import { IgdbClient, RawConsole } from "./igdbClient.js";
import { ProcessingCounts } from "../controllers/adminController.js";

type ConsoleCreateInput = {
  id: number,
  name: string,
  abbreviation: string,
  igdbChecksum: string
}

type ConsoleUpdateInput = {
  name: string,
  abbreviation: string,
  igdbChecksum: string
}

export const ConsoleService = {
  async findById (id: number): Promise<Console | null> {
    return prisma.console.findUnique({
      where: {id}
    })
  },

  async create (data: ConsoleCreateInput): Promise<Console> {
    return prisma.console.create({
      data
    })
  },

  async updateById (id: number, data: ConsoleUpdateInput): Promise<Console> {
    return prisma.console.update({
      where: {id},
      data: {
        name: data.name,
        abbreviation: data.abbreviation,
        igdbChecksum: data.igdbChecksum
      }
    })
  },

  /**
   * Synchronizes local Console table with IGDB.
   * Fetches all consoles from IGDB, then:
   *  • Inserts any missing consoles
   *  • Updates consoles where IGDB's checksum changed
   * Ensures local DB stays aligned with third party data.
   */
  async syncWithIgdb (): Promise<ProcessingCounts> {
    let updated = 0;
    let created = 0;
    let totalProcessed = 0;

    const rawConsoles: RawConsole[] = await IgdbClient.getConsoles();
    const mappedConsoles: ConsoleCreateInput[] = rawConsoles.map(mapIgdbResponseToDb);

    for (const consoleItem of mappedConsoles) {
      const existingConsole: Console | null = await this.findById(consoleItem.id);

      if (existingConsole) {
        if (existingConsole.igdbChecksum !== consoleItem.igdbChecksum) {
          await this.updateById(existingConsole.id, consoleItem);
          updated++;
        }
      }
      else {
        await this.create(consoleItem);
        created++;
      }
      totalProcessed++;
    }

    return {updated, created, totalProcessed};
  },
}


function mapIgdbResponseToDb (igdbResponse: RawConsole): ConsoleCreateInput {
  return {
    id: igdbResponse.id,
    name: igdbResponse.name,
    abbreviation: igdbResponse.abbreviation ?? igdbResponse.name,
    igdbChecksum: igdbResponse.checksum
  };
}
