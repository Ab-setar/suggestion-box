import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  message: string;
  category: 'HR' | 'Facilities' | 'IT' | 'Management' | 'Other';
  status: 'new' | 'in-review' | 'resolved';
  aiCategorized: boolean;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  message: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 2000,
  },
  category: {
    type: String,
    enum: ['HR', 'Facilities', 'IT', 'Management', 'Other'],
    default: 'Other',
  },
  status: {
    type: String,
    enum: ['new', 'in-review', 'resolved'],
    default: 'new',
  },
  aiCategorized: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
