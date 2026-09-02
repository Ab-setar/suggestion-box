import { Request, Response } from 'express';
import Feedback from '../models/Feedback';
import { categorizeFeedback } from '../services/categorizationService';

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

        return res.status(201).json({
      success: true,
      id: feedback._id,
      category: feedback.category,
      aiCategorized: feedback.aiCategorized,
    });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

export async function getAllFeedback(req: Request, res: Response) {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    return res.json(feedback);
  } catch (err) {
    console.error('Error fetching feedback:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}

const VALID_STATUSES = ['new', 'in-review', 'resolved'];

export async function updateFeedbackStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found.' });
    }

    return res.json({ success: true, feedback });
  } catch (err) {
    console.error('Error updating feedback status:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
