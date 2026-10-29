import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/sequelize.js';

// "tel joueur possède tel jeu", plus l'id de sa config Mongo
const LibraryEntry = sequelize.define(
  'LibraryEntry',
  {
    userId: { type: DataTypes.INTEGER, primaryKey: true },
    gameId: { type: DataTypes.INTEGER, primaryKey: true },
    configId: { type: DataTypes.STRING(24), allowNull: true },
  },
  { tableName: 'user_games', createdAt: 'addedAt', updatedAt: false },
);

export default LibraryEntry;
