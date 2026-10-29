import { User, Role } from '../models/sql/index.js';

export async function findUserByEmail(email) {
  return await User.findOne({ where: { email: email }, include: Role });
}

// nouveau compte = rôle "user"
export async function createUser(email, passwordHash) {
  const user = await User.create({ email: email, passwordHash: passwordHash });
  const userRole = await Role.findOne({ where: { name: 'user' } });
  await user.addRole(userRole);
  return await User.findByPk(user.id, { include: Role });
}
