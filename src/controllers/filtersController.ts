import { Request, Response } from "express";
import { GenreService } from "../services/genreService";
import { PlatformService } from "../services/platformService";

export const index = async (req: Request, res: Response) => {
  const [platformFamily, platform, genres] = await Promise.all([
    await PlatformService.findAllPlatformFamily(),
    await PlatformService.findAllPlatform(),
    await GenreService.findAll(),
  ]);

  res.status(200).json({
    message: "filters index response",
    platformFamily: platformFamily.map(pf => ({id: pf.id, label: pf.name})),
    platform: platform.map(p => ({id: p.id, label: p.abbreviation})),
    genres: genres.map(g => ({id: g.id, label: g.name}))
  });
  return;
}

