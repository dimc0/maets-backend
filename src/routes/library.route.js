import { Router } from 'express';
import { libraryController, configController } from '../controllers/index.js';
import { authRequired, requireAdmin, requireOwnerOrAdmin } from '../middlewares/auth.js';

// mergeParams pour récupérer le :userId de routes/index.js
const router = Router({ mergeParams: true });

// il faut être connecté pour tout ce qui suit
router.use(authRequired);

// consulter / retirer un jeu : le propriétaire ou un admin
router.get('/', requireOwnerOrAdmin, libraryController.getLibrary);
router.delete('/:gameId', requireOwnerOrAdmin, libraryController.removeFromLibrary);

// ajouter un jeu : admin seulement (c'est dans l'énoncé)
router.post('/', requireAdmin, libraryController.addToLibrary);

// configs : le propriétaire ou un admin
router.get('/:gameId/config', requireOwnerOrAdmin, configController.getConfig);
router.put('/:gameId/config', requireOwnerOrAdmin, configController.saveConfig);

export default router;
