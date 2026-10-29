import { configService } from '../services/index.js';

export async function getConfig(req, res) {
  const config = await configService.getConfig(req.params.userId, req.params.gameId);
  res.json(config);
}

export async function saveConfig(req, res) {
  const config = await configService.saveConfig(req.params.userId, req.params.gameId, req.body);
  res.json(config);
}
