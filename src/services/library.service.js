import { libraryRepository } from '../repositories/index.js';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
import { toLibraryEntryDto } from '../dto/library.dto.js';
import { parseId, isValidId } from '../utils/parseId.js';

async function checkUser(rawUserId) {
  const userId = parseId(rawUserId, 'userId');
  if (!(await libraryRepository.userExists(userId))) {
    throw new NotFoundError('Utilisateur introuvable');
  }
  return userId;
}

export async function getLibrary(rawUserId) {
  const userId = await checkUser(rawUserId);
  const entries = await libraryRepository.findLibrary(userId);
  return entries.map(toLibraryEntryDto);
}

export async function addToLibrary(rawUserId, body) {
  const userId = await checkUser(rawUserId);

  const gameId = body.gameId;
  if (!isValidId(gameId)) {
    throw new BadRequestError('Données invalides', { gameId: 'Identifiant de jeu (entier positif)' });
  }
  if (!(await libraryRepository.gameExists(gameId))) {
    throw new NotFoundError('Jeu introuvable');
  }
  // déjà possédé ? la clé primaire (user_id, game_id) le refuse, et errorHandler renvoie un 409

  const entry = await libraryRepository.createEntry(userId, gameId);
  return toLibraryEntryDto(entry);
}

export async function removeFromLibrary(rawUserId, rawGameId) {
  const userId = await checkUser(rawUserId);
  const gameId = parseId(rawGameId, 'gameId');

  const entry = await libraryRepository.findEntry(userId, gameId);
  if (!entry) {
    throw new NotFoundError('Ce jeu n’est pas dans la librairie de cet utilisateur');
  }

  await libraryRepository.deleteEntry(entry);
}
