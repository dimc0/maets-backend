import { gameRepository } from '../repositories/index.js';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
import { toGameDto } from '../dto/game.dto.js';
import { parseId, isValidId } from '../utils/parseId.js';

// Date au format AAAA-MM-JJ : relue par JS, elle doit redonner le même texte
// (2019-02-30 deviendrait 2019-03-02, donc elle est refusée)
function isValidDate(value) {
  if (typeof value !== 'string' || value.length !== 10) {
    return false;
  }
  const date = new Date(value);
  return !isNaN(date) && date.toISOString().slice(0, 10) === value;
}

// Vérifie ce qu'envoie le client. partial = true pour un PATCH (rien d'obligatoire).
// On ne garde que les champs connus : un "id" envoyé par le client est ignoré
function validateGameInput(body, partial) {
  const errors = {};
  const data = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '' || body.title.length > 150) {
      errors.title = 'Texte non vide de 150 caractères maximum';
    } else {
      data.title = body.title.trim();
    }
  } else if (!partial) {
    errors.title = 'Champ obligatoire';
  }

  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== 'string') {
      errors.description = 'Doit être un texte';
    } else {
      data.description = body.description;
    }
  }

  if (body.releaseDate !== undefined) {
    if (body.releaseDate !== null && !isValidDate(body.releaseDate)) {
      errors.releaseDate = 'Date invalide (format AAAA-MM-JJ)';
    } else {
      data.releaseDate = body.releaseDate;
    }
  }

  if (body.publisherId !== undefined) {
    if (!isValidId(body.publisherId)) {
      errors.publisherId = 'Identifiant d’éditeur (entier positif)';
    } else {
      data.publisherId = body.publisherId;
    }
  } else if (!partial) {
    errors.publisherId = 'Champ obligatoire';
  }

  if (Object.keys(errors).length > 0) {
    throw new BadRequestError('Données invalides', errors);
  }
  if (Object.keys(data).length === 0) {
    throw new BadRequestError('Aucun champ à modifier');
  }

  return data;
}

// renvoie le jeu, ou une 404
async function findGameOrFail(rawId) {
  const id = parseId(rawId);
  const game = await gameRepository.findGameById(id);
  if (!game) {
    throw new NotFoundError('Jeu introuvable');
  }
  return game;
}

async function checkPublisher(publisherId) {
  if (!(await gameRepository.publisherExists(publisherId))) {
    throw new BadRequestError('Données invalides', { publisherId: 'Éditeur introuvable' });
  }
}

export async function getAllGames() {
  const games = await gameRepository.findAllGames();
  return games.map(toGameDto);
}

export async function getGameById(rawId) {
  const game = await findGameOrFail(rawId);
  return toGameDto(game);
}

export async function createGame(body) {
  const data = validateGameInput(body, false);
  await checkPublisher(data.publisherId);

  const game = await gameRepository.createGame(data);
  return toGameDto(game);
}

export async function updateGame(rawId, body) {
  const game = await findGameOrFail(rawId);
  const data = validateGameInput(body, true);
  if (data.publisherId !== undefined) {
    await checkPublisher(data.publisherId);
  }

  const updatedGame = await gameRepository.updateGame(game, data);
  return toGameDto(updatedGame);
}

export async function deleteGame(rawId) {
  const game = await findGameOrFail(rawId);
  await gameRepository.deleteGame(game);
}
