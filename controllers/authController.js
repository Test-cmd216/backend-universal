import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

// In-memory stores — data resets on server restart (use Supabase for persistence)
const users = [];
const refreshTokenStore = new Set();

const registerSchema = Joi.object({
  name:     Joi.string().min(2).max(100).required(),
  email:    Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});
const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

function signAccess(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
}
function signRefresh(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
}

const register = asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  if (users.find(u => u.email === value.email)) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  const passwordHash = await bcrypt.hash(value.password, 12);
  const user = { id: uuidv4(), name: value.name, email: value.email, passwordHash, role: 'user', createdAt: new Date().toISOString() };
  users.push(user);

  logger.info(`User registered: ${user.email}`);
  const { passwordHash: _, ...safeUser } = user;
  res.status(201).json({ success: true, message: 'Account created. Please log in.', data: safeUser });
});

const login = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const user = users.find(u => u.email === value.email);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

  const match = await bcrypt.compare(value.password, user.passwordHash);
  if (!match) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken  = signAccess(payload);
  const refreshToken = signRefresh(payload);
  refreshTokenStore.add(refreshToken);

  logger.info(`User logged in: ${user.email}`);
  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, accessToken, refreshToken, data: safeUser });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokenStore.has(refreshToken)) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  const newAccessToken  = signAccess({ id: decoded.id, email: decoded.email, role: decoded.role });
  const newRefreshToken = signRefresh({ id: decoded.id, email: decoded.email, role: decoded.role });

  // Rotate: invalidate old, store new
  refreshTokenStore.delete(refreshToken);
  refreshTokenStore.add(newRefreshToken);

  res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) refreshTokenStore.delete(refreshToken);
  res.json({ success: true, message: 'Logged out successfully.' });
});

const getMe = asyncHandler(async (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

export default { register, login, refresh, logout, getMe };
