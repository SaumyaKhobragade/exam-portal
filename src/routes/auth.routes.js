import Router from 'express';
import { 
    loginUser,
    logoutUser,
    refreshAccessToken
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { handleLogout, optionalAuth } from '../middlewares/logout.middleware.js';
import { validateSession } from '../middlewares/sessionValidation.middleware.js';

const router = Router();

// Authentication routes
router.route('/login').post(loginUser);

// Logout route with middleware (tries to authenticate first, then logs out)
router.route('/logout').post(optionalAuth, logoutUser);

// Alternative logout route using only middleware (doesn't require valid auth)
router.route('/logout-safe').get(handleLogout);
router.route('/logout-safe').post(handleLogout);

// Session validation route
router.route('/validate-session').get(validateSession, (req, res) => {
    res.json({
        success: true,
        message: 'Session valid',
        user: {
            id: req.user._id,
            username: req.user.username,
            userType: req.userModel
        }
    });
});

router.route('/refresh-token').post(refreshAccessToken);

export default router;
