export async function up(queryInterface) {
  await queryInterface.bulkInsert('roles', [{ name: 'user' }, { name: 'admin' }]);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('roles', { name: ['user', 'admin'] });
}
