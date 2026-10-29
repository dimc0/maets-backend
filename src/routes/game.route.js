import { Router } from 'express';
import { gameController } from '../controllers/index.js';
import { authRequired, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// lecture : tout le monde
router.get('/', gameController.getAllGames);
router.get('/:id', gameController.getGameById);

// le reste : admin
router.post('/', authRequired, requireAdmin, gameController.createGame);
router.patch('/:id', authRequired, requireAdmin, gameController.updateGame);
router.delete('/:id', authRequired, requireAdmin, gameController.deleteGame);

export default router;
