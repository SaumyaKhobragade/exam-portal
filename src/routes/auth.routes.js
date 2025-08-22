import Router from 'express';
import { 
    loginUser,
    logoutUser,
    refreshAccessToken
} from '../controllers/auth.controller.js';

const router = Router();

// Authentication routes
router.route('/login').post(loginUser);
router.route('/logout').post(logoutUser);
router.route('/refresh-token').post(refreshAccessToken);

export default router;
