import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Rate limiter for public submission endpoint (prevents spam/abuse)
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 submissions per window
  message: { error: 'Too many submissions from this IP, please try again later.' },
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Suggestion Box API running' });
});

// Routes will be added here in the next steps
// app.use('/api/feedback', submissionLimiter, feedbackRoutes);
// app.use('/api/admin', adminRoutes);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });