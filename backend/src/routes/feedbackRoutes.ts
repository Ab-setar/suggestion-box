import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { submitFeedback, getAllFeedback } from '../controllers/feedbackController';

const router = Router();

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many submissions from this IP, please try again later.' },
});

router.post('/', submissionLimiter, submitFeedback);
router.get('/', getAllFeedback); // we'll lock this down with admin auth in the next step

export default router;