export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('games', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: Sequelize.STRING(150), allowNull: false, unique: true },
    description: { type: Sequelize.TEXT },
    release_date: { type: Sequelize.DATEONLY },
    publisher_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'publishers', key: 'id' },
      onDelete: 'RESTRICT', // on ne peut pas supprimer un éditeur qui a encore des jeux
    },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
  });

  // Postgres ne met pas d'index sur les clés étrangères tout seul
  await queryInterface.addIndex('games', ['publisher_id']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('games');
}
