import { prisma } from "../db/client.js";
import { GameType } from "@prisma/client";
import { IgdbClient, RawGameType } from "./igdbClient.js";
import { ProcessingCounts } from "../controllers/adminController.js";


type GameTypeCreateInput = {
  id: number,
  label: string,
  igdbChecksum: string
}

type GameTypeUpdateInput = {
  label: string,
  igdbChecksum: string
}

export const GameTypeService = {
  async findById (id: number): Promise<GameType | null> {
    return prisma.gameType.findUnique({
      where: {id}
    });
  },

  async create (data: GameTypeCreateInput): Promise<GameType> {
    return prisma.gameType.create({
      data
    });
  },

  async updateById (id: number, data: GameTypeUpdateInput): Promise<GameType> {
    return prisma.gameType.update({
      where: {id},
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

    const rawGameTypes: RawGameType[] = await IgdbClient.getGameTypes();
    const mappedGameTypes: GameTypeCreateInput[] = rawGameTypes.map(mapIgdbResponseToDb);

    for (const gameType of mappedGameTypes) {
      const existingGameType: GameType | null = await this.findById(gameType.id);

      if (existingGameType) {
        if (existingGameType.igdbChecksum !== gameType.igdbChecksum) {
          await this.updateById(existingGameType.id, existingGameType);
          updated++;
        }
      }
      else {
        await this.create(gameType)
        created++;
      }
      totalProcessed++;
    }
    return {updated, created, totalProcessed};
  }
}


function mapIgdbResponseToDb (igdbResponse: RawGameType): GameTypeCreateInput {
  return {
    id: igdbResponse.id,
    label: normalizeGameTypeLabel(igdbResponse.id, igdbResponse.type),
    igdbChecksum: igdbResponse.checksum
  };
}

function normalizeGameTypeLabel (id: number, label: string): string {
  const expansionIds: number[] = [2, 4, 10];
  if (expansionIds.includes(id)) return "Expansion"
  else return label
}