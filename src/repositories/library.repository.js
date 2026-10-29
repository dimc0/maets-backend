import { User, Game, Publisher, LibraryEntry } from '../models/sql/index.js';
import { GameConfig } from '../models/nosql/gameConfig.model.js';

// chaque entrée avec son jeu et l'éditeur
const withGame = {
  model: Game,
  as: 'game',
  include: { model: Publisher, as: 'publisher', attributes: ['id', 'name'] },
};

export async function userExists(userId) {
  const user = await User.findByPk(userId);
  return user !== null;
}

export async function gameExists(gameId) {
  const game = await Game.findByPk(gameId);
  return game !== null;
}

export async function findLibrary(userId) {
  return await LibraryEntry.findAll({ where: { userId: userId }, include: withGame, order: [['addedAt', 'DESC']] });
}

export async function findEntry(userId, gameId) {
  return await LibraryEntry.findOne({ where: { userId: userId, gameId: gameId }, include: withGame });
}

export async function createEntry(userId, gameId) {
  await LibraryEntry.create({ userId: userId, gameId: gameId });
  return await findEntry(userId, gameId);
}

export async function deleteEntry(entry) {
  // plus de jeu, donc plus besoin de sa config
  await entry.destroy();
  await GameConfig.deleteOne({ userId: entry.userId, gameId: entry.gameId });
}
