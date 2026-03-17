import { v4 as uuidv4 } from 'uuid';
import AppError from '../utils/AppError.js';
const users = [];
const getAll = async () => users;
const getById = async (id) => {
  const user = users.find(u => u.id === id);
  if (!user) throw new AppError('Not found', 404, 'NOT_FOUND');
  return user;
};
const create = async (body) => {
  const user = { id: uuidv4(), ...body, createdAt: new Date().toISOString() };
  users.push(user);
  return user;
};
export default { getAll, getById, create };