import { Game, Publisher } from '../models/sql/index.js';
import { GameConfig } from '../models/nosql/gameConfig.model.js';

// on charge l'éditeur avec le jeu (JOIN)
const withPublisher = { model: Publisher, as: 'publisher', attributes: ['id', 'name'] };

export async function findAllGames() {
  return await Game.findAll({ include: withPublisher, order: [['title', 'ASC']] });
}

export async function findGameById(id) {
  return await Game.findByPk(id, { include: withPublisher });
}

export async function createGame(data) {
  const game = await Game.create(data);
  return await findGameById(game.id);
}

export async function updateGame(game, data) {
  await game.update(data);
  return await findGameById(game.id);
}

export async function deleteGame(game) {
  // le CASCADE nettoie les librairies, mais Mongo il faut le faire nous-mêmes
  await game.destroy();
  await GameConfig.deleteMany({ gameId: game.id });
}

export async function publisherExists(publisherId) {
  const publisher = await Publisher.findByPk(publisherId);
  return publisher !== null;
}

