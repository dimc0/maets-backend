// Config Postgres, utilisée par l'app et par sequelize-cli
import 'dotenv/config';

export default {
  development: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
      acquire: 30000,
    },
    define: {
      underscored: true, // publisherId en JS, publisher_id en base
    },
    seederStorage: 'sequelize', // pour ne pas rejouer un seeder déjà passé
  },
};
