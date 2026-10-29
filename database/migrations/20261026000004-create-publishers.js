// Les éditeurs sont à part pour ne pas répéter leur nom dans chaque jeu
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('publishers', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('publishers');
}
