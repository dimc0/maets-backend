import { Sequelize } from 'sequelize';
import databaseConfig from '../config/database.js';

const config = databaseConfig[process.env.NODE_ENV] || databaseConfig.development;

export const sequelize = new Sequelize(config.database, config.username, config.password, config);

export async function connectPostgres() {
  await sequelize.authenticate();
  console.log(`PostgreSQL OK (${config.host}:${config.port}/${config.database})`);
}
