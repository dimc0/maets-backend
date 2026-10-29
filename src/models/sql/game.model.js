import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/sequelize.js';

const Game = sequelize.define(
  'Game',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    releaseDate: { type: DataTypes.DATEONLY },
    publisherId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: 'games' },
);

export default Game;
