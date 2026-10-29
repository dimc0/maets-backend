export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('roles', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: Sequelize.STRING(30), allowNull: false, unique: true },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('roles');
}
