import Router from 'express';
import { 
    createOwnerAccount,
    createAdminByOwner,
    getAdminsByOwner,
    deleteAdminByOwner,
    getOwnerDashboardStats,
    updateOwnerPassword
} from '../controllers/owner.controller.js';
import { verifyOwner } from '../middlewares/auth.middleware.js';

const router = Router();

// Owner routes
router.route('/create-owner').post(createOwnerAccount); // Public route for initial setup
router.route('/create-admin').post(verifyOwner, createAdminByOwner); // Only authenticated owner can create admins
router.route('/admins').get(verifyOwner, getAdminsByOwner); // Get all admins (owner only)
router.route('/delete-admin/:adminId').delete(verifyOwner, deleteAdminByOwner); // Delete admin (owner only)
router.route('/dashboard-stats').get(verifyOwner, getOwnerDashboardStats); // Dashboard statistics (owner only)
router.route('/update-password').post(updateOwnerPassword); // Update owner password (public for convenience)

export default router;
