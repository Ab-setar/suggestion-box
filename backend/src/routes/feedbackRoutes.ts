import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { submitFeedback, getAllFeedback, updateFeedbackStatus } from '../controllers/feedbackController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many submissions from this IP, please try again later.' },
});

router.post('/', submissionLimiter, submitFeedback);
router.get('/', requireAuth, getAllFeedback);
router.patch('/:id/status', requireAuth, updateFeedbackStatus);

export default router;
