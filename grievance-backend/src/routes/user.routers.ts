import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { login } from '../controllers/auth.controller.js'
import { getProfile } from '../controllers/user.controller.js';

const router = Router();

router.post('/login', login);

router.get('/profile', verifyToken, getProfile);

export default router;


