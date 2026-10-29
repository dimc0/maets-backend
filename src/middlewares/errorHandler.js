import { UniqueConstraintError } from 'sequelize';
import { AppError } from '../errors/AppError.js';

// Express repère le gestionnaire d'erreurs à ses 4 paramètres, donc on garde next même s'il ne sert pas
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Le corps de la requête n’est pas un JSON valide' },
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'Corps de requête trop volumineux (100 Ko maximum)' },
    });
  }

  // doublon sur un champ UNIQUE (titre, email...)
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      error: { code: 'CONFLICT', message: 'Cette valeur est déjà utilisée' },
    });
  }

  // bug pas prévu : on l'affiche dans le terminal, le client ne voit pas le détail
  console.error(err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Erreur interne du serveur' },
  });
}
