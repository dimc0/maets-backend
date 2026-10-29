import { Router } from 'express';
import authRoute from './auth.route.js';
import gameRoute from './game.route.js';
import libraryRoute from './library.route.js';

const router = Router();

router.use('/auth', authRoute);
router.use('/games', gameRoute);
router.use('/users/:userId/library', libraryRoute);

export default router;
