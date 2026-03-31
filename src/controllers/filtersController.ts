import { Request, Response } from "express";
import { GenreService } from "../services/genreService";
import { PlatformService } from "../services/platformService";

export const TIME_TO_BEAT_FILTERS = [
  { id: 1, label: '<10 hrs', min: 0, max: 36000 },
  { id: 2, label: '10–25 hrs', min: 36000, max: 90000 },
  { id: 3, label: '25–50 hrs', min: 90000, max: 180000 },
  { id: 4, label: '50–100 hrs', min: 180000, max: 360000 },
  { id: 5, label: '100+ hrs', min: 360000, max: null },
]

export const TOTAL_RATING_FILTERS = [
  { id: 5, label: '5 stars', min: 80 },
  { id: 4, label: '4+ stars', min: 60 },
  { id: 3, label: '3+ stars', min: 40 },
]

export const index = async (req: Request, res: Response) => {
  const [ platformFamily, platform, genres ] = await Promise.all([
    await PlatformService.findAllPlatformFamily(),
    await PlatformService.findAllPlatform(),
    await GenreService.findAll(),
  ]);

  res.status(200).json({
    message: "filters index response",
    platformFamily: platformFamily.map(pf => ({ id: pf.id, label: pf.name })),
    platform: platform.map(p => ({ id: p.id, label: p.abbreviation })),
    genres: genres.map(g => ({ id: g.id, label: g.name })),
    timeToBeat: TIME_TO_BEAT_FILTERS.map(ttb => ({ id: ttb.id, label: ttb.label })),
    totalRating: TOTAL_RATING_FILTERS.map(rating => ({ id: rating.id, label: rating.label }))
  });
  return;
}

