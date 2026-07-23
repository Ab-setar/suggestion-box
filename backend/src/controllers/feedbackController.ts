import { Request, Response } from 'express';
import Feedback from '../models/Feedback';
import { categorizeFeedback } from '../services/categorizationService';

// POST /api/feedback - public, anonymous submission
export async function submitFeedback(req: Request, res: Response) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const trimmed = message.trim();

    if (trimmed.length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters.' });
    }

    if (trimmed.length > 2000) {
      return res.status(400).json({ error: 'Message must be under 2000 characters.' });
    }

    const { category, aiCategorized } = await categorizeFeedback(trimmed);

    const feedback = await Feedback.create({
      message: trimmed,
      category,
      aiCategorized,
    });

    // Only return minimal confirmation - never echo back anything that could
    // help correlate this submission to a specific request/session
    return res.status(201).json({
      success: true,
      id: feedback._id,
      category: feedback.category,
    });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// GET /api/feedback - admin only, list all feedback (auth added in next step)
export async function getAllFeedback(req: Request, res: Response) {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    return res.json(feedback);
  } catch (err) {
    console.error('Error fetching feedback:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}