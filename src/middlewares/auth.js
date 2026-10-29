import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ROLES } from '../models/sql/role.model.js';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError.js';

// Lit le token ("Authorization: Bearer <token>") et met { id, roles } dans req.user
export function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token manquant');
  }

  const token = header.slice(7); // enlève "Bearer "
  try {
    req.user = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new UnauthorizedError('Token invalide ou expiré');
  }
  next();
}

// après authRequired : admin seulement
export function requireAdmin(req, res, next) {
  if (!req.user.roles.includes(ROLES.ADMIN)) {
    throw new ForbiddenError('Réservé aux administrateurs');
  }
  next();
}

// après authRequired : l'utilisateur de l'URL (:userId) ou un admin
export function requireOwnerOrAdmin(req, res, next) {
  const isOwner = req.user.id === Number(req.params.userId);
  const isAdmin = req.user.roles.includes(ROLES.ADMIN);
  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('Vous ne pouvez accéder qu’à votre propre librairie');
  }
  next();
}
