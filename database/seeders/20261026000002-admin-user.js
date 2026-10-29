import bcrypt from 'bcryptjs';

// Les identifiants viennent du .env, pas du code
export async function up(queryInterface) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans .env');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admins = await queryInterface.bulkInsert(
    'users',
    [{ email: email, password_hash: passwordHash }],
    { returning: ['id'] },
  );
  const adminId = admins[0].id;

  // L'admin a les deux rôles
  const roles = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name IN ('user', 'admin')", {
    type: queryInterface.sequelize.QueryTypes.SELECT,
  });
  const userRoles = [];
  for (const role of roles) {
    userRoles.push({ user_id: adminId, role_id: role.id });
  }
  await queryInterface.bulkInsert('user_roles', userRoles);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('users', { email: process.env.ADMIN_EMAIL });
}
