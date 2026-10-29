import { GameConfig } from '../models/nosql/gameConfig.model.js';

export async function findConfigById(configId) {
  return await GameConfig.findById(configId);
}

// upsert : crée la config si elle n'existe pas, sinon la remplace
export async function saveConfig(userId, gameId, settings) {
  return await GameConfig.findOneAndUpdate(
    { userId: userId, gameId: gameId },
    { settings: settings },
    { upsert: true, returnDocument: 'after' }, // renvoie la config après la modif
  );
}

// on garde l'id Mongo dans la ligne Postgres de la librairie
export async function linkConfigToEntry(entry, configId) {
  await entry.update({ configId: configId });
}
