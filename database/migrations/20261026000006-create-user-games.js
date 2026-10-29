// La librairie : quel joueur possède quel jeu
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('user_games', {
    user_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    game_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: { model: 'games', key: 'id' },
      onDelete: 'CASCADE',
    },
    // id du document Mongo (24 caractères), null tant qu'il n'y a pas de config
    config_id: { type: Sequelize.STRING(24), allowNull: true, unique: true },
    added_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
  });

  // la clé primaire commence par user_id, il manque juste un index sur game_id
  await queryInterface.addIndex('user_games', ['game_id']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('user_games');
}
