import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { fakerFR as faker } from '@faker-js/faker';
import { GameConfig } from '../../src/models/nosql/gameConfig.model.js';

// Données de démo inventées par Faker (emails en @example.com, donc rien de réel)
const NB_PUBLISHERS = 8;
const NB_GAMES = 30;
const NB_USERS = 25;
const KINDS = ['racing', 'rpg', 'fps', 'strategy'];

// Chaque type de jeu a ses propres réglages, c'est pour ça qu'ils vont dans Mongo
function buildSettings(kind) {
  if (kind === 'racing') {
    return {
      graphics: { quality: faker.helpers.arrayElement(['low', 'medium', 'high']), resolution: '1920x1080' },
      controls: { steeringSensitivity: faker.number.int({ min: 1, max: 10 }) },
      assists: { abs: faker.datatype.boolean(), racingLine: faker.datatype.boolean() },
    };
  }
  if (kind === 'rpg') {
    return {
      difficulty: faker.helpers.arrayElement(['story', 'normal', 'hard']),
      subtitles: { enabled: faker.datatype.boolean(), language: faker.helpers.arrayElement(['fr', 'en']) },
      autosaveMinutes: faker.helpers.arrayElement([5, 10, 15]),
    };
  }
  if (kind === 'fps') {
    return {
      graphics: { quality: faker.helpers.arrayElement(['low', 'medium', 'high']), fov: faker.number.int({ min: 70, max: 110 }) },
      mouse: { sensitivity: faker.number.int({ min: 1, max: 10 }), invertY: faker.datatype.boolean() },
      keybinds: { jump: 'SPACE', crouch: 'C', reload: 'R' },
    };
  }
  return {
    gameSpeed: faker.helpers.arrayElement(['slow', 'normal', 'fast']),
    autoPause: faker.datatype.boolean(),
    notifications: ['attack', 'research'],
  };
}

export async function up(queryInterface) {
  faker.seed(2026); // pour retomber sur les mêmes données à chaque fois
  const passwordHash = await bcrypt.hash(process.env.SEED_USER_PASSWORD, 10);
  await mongoose.connect(process.env.MONGODB_URI);

  const publisherRows = [];
  for (const name of faker.helpers.uniqueArray(faker.company.name, NB_PUBLISHERS)) {
    publisherRows.push({ name: name });
  }
  const publishers = await queryInterface.bulkInsert('publishers', publisherRows, { returning: ['id'] });

  const gameRows = [];
  for (let i = 0; i < NB_GAMES; i++) {
    gameRows.push({
      title: `${faker.word.adjective()} ${faker.word.noun()} ${i + 1}`,
      description: faker.lorem.sentence(),
      release_date: faker.date.past({ years: 20 }),
      publisher_id: faker.helpers.arrayElement(publishers).id,
    });
  }
  const games = await queryInterface.bulkInsert('games', gameRows, { returning: ['id'] });

  const userRows = [];
  for (let i = 1; i <= NB_USERS; i++) {
    userRows.push({ email: `joueur${i}@example.com`, password_hash: passwordHash });
  }
  const users = await queryInterface.bulkInsert('users', userRows, { returning: ['id'] });

  const roles = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name = 'user'", {
    type: queryInterface.sequelize.QueryTypes.SELECT,
  });
  const userRoleRows = [];
  for (const user of users) {
    userRoleRows.push({ user_id: user.id, role_id: roles[0].id });
  }
  await queryInterface.bulkInsert('user_roles', userRoleRows);

  // 0 à 6 jeux par joueur, et une config pour à peu près 2 jeux sur 3
  const libraryRows = [];
  for (const user of users) {
    const ownedGames = faker.helpers.arrayElements(games, { min: 0, max: 6 });
    for (const game of ownedGames) {
      let configId = null;
      if (faker.datatype.boolean({ probability: 0.66 })) {
        const kind = KINDS[game.id % KINDS.length];
        const config = await GameConfig.create({ userId: user.id, gameId: game.id, settings: buildSettings(kind) });
        configId = config._id.toString();
      }
      libraryRows.push({ user_id: user.id, game_id: game.id, config_id: configId });
    }
  }
  await queryInterface.bulkInsert('user_games', libraryRows);

  await mongoose.disconnect();
}

export async function down(queryInterface) {
  await mongoose.connect(process.env.MONGODB_URI);
  await GameConfig.deleteMany({});
  await mongoose.disconnect();

  // pas besoin de vider user_roles et user_games, le CASCADE s'en occupe
  await queryInterface.sequelize.query("DELETE FROM users WHERE email LIKE '%@example.com'");
  await queryInterface.sequelize.query('DELETE FROM games');
  await queryInterface.sequelize.query('DELETE FROM publishers');
}
