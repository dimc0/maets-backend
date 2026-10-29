import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/index.js';
import { BadRequestError, ConflictError, UnauthorizedError } from '../errors/AppError.js';
import { toUserDto } from '../dto/user.dto.js';
import { env } from '../config/env.js';

// texte@domaine.ext : au moins 2 caractères après le dernier point, pas d'espace,
// et 191 caractères max comme la colonne email
function isValidEmail(email) {
  if (typeof email !== 'string' || email.length > 191 || email.includes(' ')) {
    return false;
  }
  const at = email.indexOf('@');
  const domain = email.slice(at + 1);
  const lastDot = domain.lastIndexOf('.');
  return at > 0 && !domain.includes('@') && lastDot > 0 && domain.length - lastDot > 2;
}

function validateRegisterInput(body) {
  const errors = {};

  if (!isValidEmail(body.email)) {
    errors.email = 'Adresse email invalide';
  }
  if (typeof body.password !== 'string' || body.password.length < 8) {
    errors.password = '8 caractères minimum';
  }

  if (Object.keys(errors).length > 0) {
    throw new BadRequestError('Données invalides', errors);
  }
}

// Inscription (rôle "user" par défaut)
export async function register(body) {
  validateRegisterInput(body);

  if (await userRepository.findUserByEmail(body.email)) {
    throw new ConflictError('Cet email est déjà utilisé');
  }

  // on stocke le hash, jamais le mot de passe
  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await userRepository.createUser(body.email, passwordHash);
  return toUserDto(user);
}

// Connexion : renvoie un token JWT
export async function login(body) {
  if (typeof body.email !== 'string' || typeof body.password !== 'string') {
    throw new BadRequestError('Email et mot de passe obligatoires');
  }

  const user = await userRepository.findUserByEmail(body.email);
  // même message si l'email n'existe pas ou si le mot de passe est faux,
  // pour ne pas dire quels emails sont inscrits
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    throw new UnauthorizedError('Email ou mot de passe incorrect');
  }

  const userDto = toUserDto(user);
  // le token contient l'id et les rôles, donc pas de session à garder côté serveur
  const token = jwt.sign({ id: userDto.id, roles: userDto.roles }, env.jwtSecret, { expiresIn: '2h' });

  return { token: token, user: userDto };
}
