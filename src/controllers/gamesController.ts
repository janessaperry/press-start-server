import { Request, Response } from "express";
import { prisma } from "../db/client.js";

interface GameQuery {
  search?: string,
  platform?: string,
  status?: string,
}

type GameOverviewDTO = {
  id: number,
  name: string,
  coverUrl: string | null,
  releaseDate: string,
  slug: string,
  totalRating: string,
  platforms: {
    id: number,
    abbreviation: string | null,
  }[],
  gameType: string,
}

type GameDetailsDTO = {
  id: number,
  name: string,
  coverUrl: string,
  releaseDate: string,
  slug: string,
  totalRating: string,
  summary: string,
}

export const index = async (req: Request<any, any, any, GameQuery>, res: Response) => {
  const {search, platform, status} = req.query;

  let comingSoon;
  let newRelease;
  if (status) {
    const statusArr = status.split(',');

    if (statusArr.includes('coming-soon')) {
      let oneYearAhead = new Date();
      oneYearAhead.setMonth(oneYearAhead.getMonth() + 12);

      const data = await prisma.game.findMany({
        where: {
          releaseDate: {
            gte: new Date(Date.now()),
            lte: oneYearAhead
          }
        },
        orderBy: {
          releaseDate: 'asc'
        },
        select: {
          id: true,
          name: true,
          coverUrl: true,
          releaseDate: true,
          slug: true,
          totalRating: true,
          platforms: {
            select: {
              platform: {
                select: {
                  id: true,
                  abbreviation: true,
                }
              }
            }
          },
          gameType: {
            select: {
              label: true
            }
          }
        },
        take: 18
      });
      
      comingSoon = data.map((game): GameOverviewDTO => {
        const releaseDate = game.releaseDate ? game.releaseDate.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) : "Release date unknown";
        const rating = game.totalRating ? String(game.totalRating) : 'N/A';
        const platforms = game.platforms.map(p => {
          return {
            id: p.platform.id,
            abbreviation: p.platform.abbreviation
          }
        });
        const gameType: string = game.gameType.label;


        return {
          id: game.id,
          name: game.name,
          coverUrl: game.coverUrl,
          releaseDate,
          slug: game.slug,
          totalRating: rating,
          platforms,
          gameType
        }
      })
    }

    if (statusArr.includes('new-release')) {
      let sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const data = await prisma.game.findMany({
        where: {
          releaseDate: {
            gte: sixMonthsAgo,
            lte: new Date()
          }
        },
        orderBy: {
          releaseDate: 'desc'
        },
        select: {
          id: true,
          name: true,
          coverUrl: true,
          releaseDate: true,
          slug: true,
          totalRating: true,
          platforms: {
            select: {
              platform: {
                select: {
                  id: true,
                  abbreviation: true,
                }
              }
            }
          },
          gameType: {
            select: {
              label: true,
            }
          }
        },
        take: 18
      })

      newRelease = data.map((game): GameOverviewDTO => {
        const releaseDate = game.releaseDate ? game.releaseDate.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) : "Release date unknown";
        const rating = game.totalRating ? String(game.totalRating) : 'N/A';
        const platforms = game.platforms.map(p => {
          return {
            id: p.platform.id,
            abbreviation: p.platform.abbreviation
          }
        });


        return {
          id: game.id,
          name: game.name,
          coverUrl: game.coverUrl,
          releaseDate,
          slug: game.slug,
          totalRating: rating,
          platforms,
          gameType: game.gameType.label
        }
      })
    }
  }

  res.status(200).json({
    "message": "request made to /index",
    "searchQuery": search,
    "platform": platform,
    status: {
      comingSoon,
      newRelease
    },
  })
  return;
}

export const show = async (req: Request, res: Response) => {
  const {gameId} = req.params;
  console.log(gameId);

  res.status(200).json({
    "message": "request made to /show/:gameId"
  })
}