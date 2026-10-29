export function toConfigDto(config) {
  return {
    gameId: config.gameId,
    settings: config.settings,
    updatedAt: config.updatedAt,
  };
}
