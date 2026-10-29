import { toGameDto } from './game.dto.js';

export function toLibraryEntryDto(entry) {
  return {
    game: toGameDto(entry.game),
    addedAt: entry.addedAt,
  };
}
