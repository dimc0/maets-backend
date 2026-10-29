import { libraryRepository, configRepository } from '../repositories/index.js';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
import { toConfigDto } from '../dto/config.dto.js';
import { parseId } from '../utils/parseId.js';

// settings doit être un objet, sans clé qui commence par $ (on regarde le premier niveau)
function validateConfigInput(body) {
  const settings = body.settings;

  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
    throw new BadRequestError('Données invalides', { settings: 'Doit être un objet JSON, ex. { "fov": 90 }' });
  }

  // une clé en $ c'est un opérateur Mongo ($where...), donc risque d'injection NoSQL
  for (const key of Object.keys(settings)) {
    if (key.startsWith('$')) {
      throw new BadRequestError('Données invalides', { settings: `Clé interdite : ${key}` });
    }
  }

  return settings;
}

// pas de config sans jeu possédé, donc on vérifie d'abord dans Postgres
async function findEntryOrFail(rawUserId, rawGameId) {
  const userId = parseId(rawUserId, 'userId');
  const gameId = parseId(rawGameId, 'gameId');

  const entry = await libraryRepository.findEntry(userId, gameId);
  if (!entry) {
    throw new NotFoundError('Ce jeu n’est pas dans la librairie de cet utilisateur');
  }
  return entry;
}

export async function getConfig(rawUserId, rawGameId) {
  const entry = await findEntryOrFail(rawUserId, rawGameId);

  // le config_id (Postgres) donne le document Mongo
  const config = entry.configId ? await configRepository.findConfigById(entry.configId) : null;
  if (!config) {
    throw new NotFoundError('Aucune configuration enregistrée pour ce jeu');
  }

  return toConfigDto(config);
}

export async function saveConfig(rawUserId, rawGameId, body) {
  const entry = await findEntryOrFail(rawUserId, rawGameId);
  const settings = validateConfigInput(body);

  const config = await configRepository.saveConfig(entry.userId, entry.gameId, settings);

  // première sauvegarde : on note l'id Mongo dans Postgres
  if (entry.configId === null) {
    await configRepository.linkConfigToEntry(entry, config._id.toString());
  }

  return toConfigDto(config);
}
