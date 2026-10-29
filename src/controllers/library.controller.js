import { libraryService } from '../services/index.js';

export async function getLibrary(req, res) {
  const library = await libraryService.getLibrary(req.params.userId);
  res.json(library);
}

export async function addToLibrary(req, res) {
  const entry = await libraryService.addToLibrary(req.params.userId, req.body);
  res.status(201).json(entry);
}

export async function removeFromLibrary(req, res) {
  await libraryService.removeFromLibrary(req.params.userId, req.params.gameId);
  res.status(204).end();
}
