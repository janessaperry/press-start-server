import { ProcessingCounts } from "../controllers/adminController.js";
import { prisma } from "../db/client.js";
import { GameType, Prisma } from "../generated/prisma/client.js";
import { IgdbClient } from "../integrations/igdbClient.js";
import { RawGameType } from "../integrations/igdbClient.types";

export const GameTypeService = {
  async findById (id: number): Promise<GameType | null> {
    return prisma.gameType.findUnique({
      where: { id }
    });
  },

  async create (data: Prisma.GameTypeCreateInput): Promise<GameType> {
    return prisma.gameType.create({
      data
    });
  },

  async updateById (id: number, data: Prisma.GameTypeUpdateInput): Promise<GameType> {
    return prisma.gameType.update({
      where: { id },
      data: {
        label: data.label,
        igdbChecksum: data.igdbChecksum
      }
    });
  },

  async syncWithIgdb (): Promise<ProcessingCounts> {
    let updated = 0;
    let created = 0;
    let totalProcessed = 0;

    const rawGameTypes = await IgdbClient.getGameTypes();
    const mappedGameTypes = rawGameTypes.map(mapIgdbResponseToDb);

    for (const gameType of mappedGameTypes) {
      const existingGameType = await this.findById(gameType.id);

      if (existingGameType) {
        if (existingGameType.igdbChecksum !== gameType.igdbChecksum) {
          await this.updateById(existingGameType.id, gameType);
          updated++;
        }
      }
      else {
        await this.create(gameType)
        created++;
      }
      totalProcessed++;
    }
    console.log(`Game type sync complete. Total processed: ${totalProcessed}`)
    return { updated, created, totalProcessed };
  }
}

function mapIgdbResponseToDb (igdbResponse: RawGameType): Prisma.GameTypeCreateInput {
  return {
    id: igdbResponse.id,
    label: normalizeGameTypeLabel(igdbResponse.id, igdbResponse.type),
    igdbChecksum: igdbResponse.checksum
  };
}

/**
 * Normalizes GameType labels:
 * - IDs 2, 4, 10 ("Expansion", "Standalone Expansion", "Expanded Game") → "Expansion"
 * - All other labels remain unchanged
 */
function normalizeGameTypeLabel (id: number, label: string): string {
  const expansionIds = [ 2, 4, 10 ];
  if (expansionIds.includes(id)) {
    return "Expansion"
  }
  else {
    return label
  }
}