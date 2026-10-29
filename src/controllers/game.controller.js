import { gameService } from '../services/index.js';

export async function getAllGames(req, res) {
  const games = await gameService.getAllGames();
  res.json(games);
}

export async function getGameById(req, res) {
  const game = await gameService.getGameById(req.params.id);
  res.json(game);
}

export async function createGame(req, res) {
  const game = await gameService.createGame(req.body);
  res.status(201).json(game);
}

export async function updateGame(req, res) {
  const game = await gameService.updateGame(req.params.id, req.body);
  res.json(game);
}

export async function deleteGame(req, res) {
  await gameService.deleteGame(req.params.id);
  res.status(204).end();
}
