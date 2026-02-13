import { Router } from 'express';
import { login, verifyOtp, refreshAccessToken } from '../controllers/auth.controller.js'; 
import { getProfile } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { getMyGrievances, submitGrievance, getGrievanceById, submitGrievanceWithFiles } from '../controllers/grievance.controller.js';
import { getAllCategories, getSubcategories } from '../controllers/category.controller.js';
import { uploadGrievanceFiles } from '../middleware/upload.middleware.js';

const router = Router();


router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/refresh-token', refreshAccessToken); 

router.get('/profile', verifyToken, getProfile);


router.get('/categories', getAllCategories);
router.get('/subcategories/:categoryId', getSubcategories);


router.post('/grievances', verifyToken, submitGrievance);
router.get('/my-grievances', verifyToken, getMyGrievances);
router.get('/grievances/:id', verifyToken, getGrievanceById);
router.post('/grievances', verifyToken, submitGrievance);  // JSON only
router.post('/grievances/upload', verifyToken, uploadGrievanceFiles.array('files', 5), submitGrievanceWithFiles );

export default router;