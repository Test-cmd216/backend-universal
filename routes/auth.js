import { Router } from 'express';
import authController from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login',    authController.login);
router.post('/refresh',  authController.refresh);   // issue new access token
router.post('/logout',   authController.logout);    // invalidate refresh token
router.get('/me', protect, authController.getMe);   // get current user

export default router;
