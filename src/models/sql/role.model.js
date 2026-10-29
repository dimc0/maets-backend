import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/sequelize.js';

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

const Role = sequelize.define(
  'Role',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  },
  { tableName: 'roles', timestamps: false },
);

export default Role;
