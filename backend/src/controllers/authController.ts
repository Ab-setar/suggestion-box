import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

export async function registerAdmin(req: Request, res: Response) {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: 'Username already taken.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      username,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'reviewer',
    });

    return res.status(201).json({
      success: true,
      admin: { id: admin._id, username: admin.username, role: admin.role },
    });
  } catch (err) {
    console.error('Error registering admin:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}

export async function loginAdmin(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      token,
      admin: { id: admin._id, username: admin.username, role: admin.role },
    });
  } catch (err) {
    console.error('Error logging in:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
