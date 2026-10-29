import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/sequelize.js';

const Publisher = sequelize.define(
  'Publisher',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  },
  { tableName: 'publishers' },
);

export default Publisher;
