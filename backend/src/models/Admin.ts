import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  username: string;
  passwordHash: string;
  role: 'admin' | 'reviewer';
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'reviewer'],
    default: 'reviewer',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IAdmin>('Admin', AdminSchema);