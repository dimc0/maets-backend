import mongoose from 'mongoose';

// Réglages d'un jeu pour un joueur. Chaque jeu a les siens, donc settings est libre.
// L'_id est gardé côté Postgres dans user_games.config_id
const gameConfigSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true },
    gameId: { type: Number, required: true },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    collection: 'game_configs',
    timestamps: true,
    minimize: false, // sinon Mongoose enlève settings quand il est vide
  },
);

// une seule config par joueur et par jeu
gameConfigSchema.index({ userId: 1, gameId: 1 }, { unique: true });

export const GameConfig = mongoose.model('GameConfig', gameConfigSchema);
