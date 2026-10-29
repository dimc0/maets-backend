// Table de liaison entre users et roles
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('user_roles', {
    user_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    role_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: { model: 'roles', key: 'id' },
      onDelete: 'CASCADE',
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('user_roles');
}
