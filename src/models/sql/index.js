import User from './user.model.js';
import Role from './role.model.js';
import Publisher from './publisher.model.js';
import Game from './game.model.js';
import LibraryEntry from './libraryEntry.model.js';

// Juste les associations dont le code a besoin (les clés étrangères sont dans les migrations)
User.belongsToMany(Role, { through: 'user_roles', foreignKey: 'userId', otherKey: 'roleId', timestamps: false });
Game.belongsTo(Publisher, { foreignKey: 'publisherId', as: 'publisher' });
LibraryEntry.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });

export { User, Role, Publisher, Game, LibraryEntry };
