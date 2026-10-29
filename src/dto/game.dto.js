// DTO = ce qu'on renvoie au client (la vue du MVC)
export function toGameDto(game) {
  return {
    id: game.id,
    title: game.title,
    description: game.description,
    releaseDate: game.releaseDate,
    publisher: game.publisher ? { id: game.publisher.id, name: game.publisher.name } : undefined,
  };
}
