import { NotFoundError } from '../errors/AppError.js';

// on arrive ici seulement si aucune route n'a répondu
export function notFound(req, res, next) {
  next(new NotFoundError(`Route introuvable : ${req.method} ${req.originalUrl}`));
}
