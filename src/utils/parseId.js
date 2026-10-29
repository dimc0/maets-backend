import { BadRequestError } from '../errors/AppError.js';

// le max d'un INTEGER dans Postgres
const MAX_ID = 2147483647;

export function isValidId(value) {
  return Number.isInteger(value) && value >= 1 && value <= MAX_ID;
}

// les paramètres d'URL arrivent toujours sous forme de texte
export function parseId(value, name = 'id') {
  const id = Number(value);
  if (!isValidId(id)) {
    throw new BadRequestError(`Le paramètre "${name}" doit être un entier positif`);
  }
  return id;
}
