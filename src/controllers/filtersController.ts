import { Request, Response } from "express";
import { LibraryFormat, LibraryStatus } from "../generated/prisma/enums";
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

export const RELEASE_DATE_FILTERS = [
  { id: 1, label: 'New releases', minMonths: -6, maxMonths: 0 },
  { id: 2, label: 'Coming soon', minMonths: 0, maxMonths: 12 },
  { id: 3, label: 'Announced (date TDB)', minMonths: null, maxMonths: null },
]

export const GAME_TYPE_FILTERS = [
  { id: 1, label: 'DLC', gameTypeIds: [ 1 ] },
  { id: 2, label: 'Expansion', gameTypeIds: [ 2, 4, 10 ] },
  { id: 3, label: 'Bundles', gameTypeIds: [ 3 ] },
  { id: 4, label: 'Ports, Remakes & Remasters', gameTypeIds: [ 8, 9, 11 ] }
]

export const LIBRARY_GAME_TYPE_FILTERS = [
  { id: 0, label: 'Main Game', gameTypeIds: [ 0 ] },
  ...GAME_TYPE_FILTERS
]

export const LIBRARY_FORMAT_FILTERS = [
  { id: 1, label: 'Digital', enum: LibraryFormat.DIGITAL },
  { id: 2, label: 'Physical', enum: LibraryFormat.PHYSICAL },
  { id: 999, label: 'Unspecified', enum: null },
]

export const LIBRARY_FORMAT_CONTROLS = [
  { id: 1, label: 'Digital', enum: LibraryFormat.DIGITAL },
  { id: 2, label: 'Physical', enum: LibraryFormat.PHYSICAL },
]

export const LIBRARY_STATUS_FILTERS = [
  { id: 1, label: 'Want to Play', enum: LibraryStatus.WANT_TO_PLAY },
  { id: 2, label: 'Currently Playing', enum: LibraryStatus.PLAYING },
  { id: 3, label: 'Done Playing', enum: LibraryStatus.PLAYED },
  { id: 4, label: 'On Pause', enum: LibraryStatus.ON_PAUSE },
  { id: 5, label: 'Wishlist', enum: LibraryStatus.WISHLIST },
]

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
  return;
}

