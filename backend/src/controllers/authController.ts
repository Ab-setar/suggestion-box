import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

function isValidCredentialInput(username: unknown, password: unknown): boolean {
  // Rejects anything that isn't a plain string - this is what stops
  // NoSQL injection payloads like { "$ne": null } from ever reaching MongoDB
  return typeof username === 'string' && typeof password === 'string';
}

// POST /api/admin/setup - one-time only, creates the FIRST admin account.
// Requires a secret key only you know. Locks itself out after one admin exists.
export async function setupFirstAdmin(req: Request, res: Response) {
  try {
    const { username, password, setupKey } = req.body;

    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({ error: 'Invalid setup key.' });
    }

    const existingCount = await Admin.countDocuments();
    if (existingCount > 0) {
      return res.status(403).json({ error: 'Setup already completed. Use an admin account to add more.' });
    }

    if (!isValidCredentialInput(username, password)) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      username,
      passwordHash,
      role: 'admin',
    });

    return res.status(201).json({
      success: true,
      admin: { id: admin._id, username: admin.username, role: admin.role },
    });
  } catch (err) {
    console.error('Error during first admin setup:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}

// POST /api/admin/register - requires an already-logged-in admin (see adminRoutes.ts)
export async function registerAdmin(req: Request, res: Response) {
  try {
    const { username, password, role } = req.body;

    if (!isValidCredentialInput(username, password)) {
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

    if (!isValidCredentialInput(username, password)) {
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