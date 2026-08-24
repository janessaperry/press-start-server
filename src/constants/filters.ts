import { LibraryFormat, LibraryStatus } from "../generated/prisma/enums";

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
  { id: 0, label: 'Main Game', gameTypeIds: [ 0 ] },
  { id: 1, label: 'DLC', gameTypeIds: [ 1 ] },
  { id: 2, label: 'Expansion', gameTypeIds: [ 2, 4, 10 ] },
  { id: 3, label: 'Bundles', gameTypeIds: [ 3 ] },
  { id: 4, label: 'Ports, Remakes & Remasters', gameTypeIds: [ 8, 9, 11 ] }
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
  { id: 5, label: 'Play Anytime', enum: LibraryStatus.PLAY_ANYTIME },
  { id: 6, label: 'Wishlist', enum: LibraryStatus.WISHLIST },
]