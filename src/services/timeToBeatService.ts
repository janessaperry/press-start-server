import { ProcessingCounts } from "../controllers/adminController";
import { prisma } from "../db/client";
import { Prisma, TimeToBeat } from "../generated/prisma/client";
import { IgdbClient, RawTimeToBeat } from "./igdbClient";

export const TimeToBeatService = {
  async findById (id: number): Promise<TimeToBeat | null> {
    return prisma.timeToBeat.findUnique({
      where: {id}
    });
  },

  async findManyById (gameIdsToCheck: number[]): Promise<{id: number}[]> {
    return prisma.game.findMany({
      where: {
        id: {
          in: gameIdsToCheck
        }
      },
      select: {
        id: true
      }
    });
  },

  async create (data: Prisma.TimeToBeatCreateInput): Promise<TimeToBeat> {
    return prisma.timeToBeat.create({
      data
    })

  },

  async updateById (id: number, data: Prisma.TimeToBeatUpdateInput): Promise<TimeToBeat> {
    return prisma.timeToBeat.update({
      where: {id},
      data
    })
  },

  async syncWithIgdb (): Promise<ProcessingCounts> {
    let created = 0;
    let updated = 0;
    let totalProcessed = 0;

    let limit = 500;
    let offset = 0;

    while (true) {
      const rawTimesToBeat = await IgdbClient.getTimeToBeat(limit, offset);
      if (rawTimesToBeat.length === 0) break;
      const gameIdsToCheck = rawTimesToBeat.map(item => item.game_id);

      const getValidGameIds = await this.findManyById(gameIdsToCheck);
      const validGameIds = getValidGameIds.map(item => item.id);

      const filteredRawTimesToBeat = rawTimesToBeat.filter(item => validGameIds.includes(item.game_id))
      const mappedTimesToBeat = filteredRawTimesToBeat.map(mapIgdbResponseToDb);

      for (const timeToBeat of mappedTimesToBeat) {
        const existingTimeToBeat = await this.findById(timeToBeat.id);

        if (existingTimeToBeat) {
          await this.updateById(timeToBeat.id, timeToBeat)
          updated++;
        }
        else {
          await this.create(timeToBeat);
          created++;

        }
        totalProcessed++;
      }
      offset += limit;
    }
    return {created, updated, totalProcessed}
  },
}

function mapIgdbResponseToDb (igdbResponse: RawTimeToBeat) {
  return {
    id: igdbResponse.id,
    hastily: igdbResponse.hastily,
    normally: igdbResponse.normally,
    completely: igdbResponse.completely,
    count: igdbResponse.count,
    igdbChecksum: igdbResponse.checksum,
    game: {
      connect: {id: igdbResponse.game_id}
    },
  }
}