import { Router } from 'express';
import { login } from '../controllers/auth.controller.js'
import { getProfile } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { getMyGrievances, submitGrievance } from '../controllers/grievance.controller.js';
const router = Router();

router.post('/login', login);

router.post( '/grievances', verifyToken, submitGrievance )

router.get('/profile', verifyToken, getProfile);

router.get('/my-grievances', verifyToken, getMyGrievances)

export default router;