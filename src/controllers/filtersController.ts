import { Request, Response } from "express";
import {
  GAME_TYPE_FILTERS,
  LIBRARY_FORMAT_CONTROLS,
  LIBRARY_FORMAT_FILTERS,
  LIBRARY_GAME_TYPE_FILTERS,
  LIBRARY_STATUS_FILTERS,
  RELEASE_DATE_FILTERS,
  TIME_TO_BEAT_FILTERS,
  TOTAL_RATING_FILTERS
} from "../constants/filters";
import { GenreService } from "../services/genreService";
import { PlatformService } from "../services/platformService";

export const index = async (req: Request, res: Response) => {
  const context = req.query.context;
  const userId = Number(req.query.userId);
  const isLibrary = context === 'library';

  const [ platformFamily, platform, genres ] = await Promise.all([
    PlatformService.findAllPlatformFamily(),
    PlatformService.findAllPlatform(),
    isLibrary ? Promise.resolve([]) : GenreService.findAll(),
  ]);

  const userLibraryGenres = isLibrary && userId
    ? await GenreService.findByUserId(userId)
    : [];

  if (isLibrary) platform.push({ id: 0, abbreviation: 'Unspecified' });
  const gameTypeFilters = isLibrary ? LIBRARY_GAME_TYPE_FILTERS : GAME_TYPE_FILTERS;

  res.status(200).json({
    platformFamily: platformFamily.map(pf => ({ id: pf.id, label: pf.name })),
    platform: platform.map(p => ({ id: p.id, label: p.abbreviation })),
    genres: isLibrary ? userLibraryGenres.map(g => ({ id: g.id, label: g.name })) : genres.map(g => ({
      id: g.id,
      label: g.name
    })),
    timeToBeat: TIME_TO_BEAT_FILTERS.map(ttb => ({ id: ttb.id, label: ttb.label })),
    totalRating: TOTAL_RATING_FILTERS.map(rating => ({ id: rating.id, label: rating.label })),
    releaseDate: !isLibrary ? RELEASE_DATE_FILTERS.map(releaseDate => ({
      id: releaseDate.id,
      label: releaseDate.label
    })) : undefined,
    gameType: gameTypeFilters.map(gt => ({ id: gt.id, label: gt.label })),
    libraryStatus: isLibrary ? LIBRARY_STATUS_FILTERS : undefined,
    libraryFormat: isLibrary ? LIBRARY_FORMAT_FILTERS : undefined,
    libraryFormatControls: isLibrary ? LIBRARY_FORMAT_CONTROLS : undefined,
  });
}

