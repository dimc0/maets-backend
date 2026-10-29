import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/sequelize.js';

// le format de l'email est vérifié dans auth.service.js
const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(191), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(100), allowNull: false }, // hash bcrypt
  },
  { tableName: 'users' },
);

export default User;
