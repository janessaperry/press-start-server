import { LIBRARY_FORMAT_FILTERS, LIBRARY_STATUS_FILTERS } from "../controllers/filtersController";
import { prisma } from "../db/client";
import { mapToGameOverviewDTO } from "./game/gameService";

export const libraryService = {
  async findAll(userId: number) {
    const library = await prisma.userGame.findMany({
      where: { userId },
      select: {
        id: true,
        libraryStatus: true,
        libraryFormat: true,
        libraryPlatform: {
          select: {
            id: true,
            abbreviation: true,
          },
        },
        gameDetails: {
          select: {
            id: true,
            name: true,
            slug: true,
            coverId: true,
            releaseDate: true,
            totalRating: true,
            platforms: {
              select: {
                id: true,
                abbreviation: true,
              },
              orderBy: {
                abbreviation: 'asc',
              }
            },
            gameType: {
              select: {
                id: true,
                label: true
              }
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return library.map(libraryGame => (
      {
        id: libraryGame.id,
        libraryStatus: libraryGame.libraryStatus ? LIBRARY_STATUS_FILTERS.find(item => item.enum === libraryGame.libraryStatus) : undefined,
        libraryFormat: libraryGame.libraryFormat ? LIBRARY_FORMAT_FILTERS.find(item => item.enum === libraryGame.libraryFormat) : undefined,
        libraryPlatform: libraryGame.libraryPlatform ? {
          id: libraryGame.libraryPlatform.id,
          label: libraryGame.libraryPlatform.abbreviation
        } : undefined,
        gameOverview: mapToGameOverviewDTO(libraryGame.gameDetails)
      }
    ));
  },

  async getCounts(userId: number) {
    const libraryStatusCounts =  await prisma.userGame.groupBy({
      where: { userId },
      by: [ 'libraryStatus' ],
      _count: true,
    });

    const counts: { label: string, count: number }[] = LIBRARY_STATUS_FILTERS.map((item) => {
      const count = libraryStatusCounts.find((count) => item.enum === count.libraryStatus)?._count ?? 0;
      return {label: item.label, count}
    });

    return counts;
  },

  async findById(userId: number, igdbGameId: number) {
    return await prisma.userGame.findUnique({
      where: {
        userIdGameId: {
          userId, igdbGameId
        }
      },
      select: {
        libraryPlatform: {
          select: {
            id: true,
            abbreviation: true
          }
        },
        libraryFormat: true,
        libraryStatus: true,
      }
    })
  }
}