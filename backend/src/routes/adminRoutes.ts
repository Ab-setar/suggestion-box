import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { setupFirstAdmin, registerAdmin, loginAdmin } from '../controllers/authController';
import { requireAuth, requireAdminRole } from '../middleware/authMiddleware';

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts. Please try again later.' },
});

router.post('/setup', setupFirstAdmin);
router.post('/register', requireAuth, requireAdminRole, registerAdmin);
router.post('/login', loginLimiter, loginAdmin);

export default router;