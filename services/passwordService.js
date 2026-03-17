import { v4 as uuidv4 } from 'uuid';
import AppError from '../utils/AppError.js';
const passwords = [];
const getAll = async () => passwords;
const getById = async (id) => {
  const password = passwords.find(p => p.id === id);
  if (!password) throw new AppError('Not found', 404, 'NOT_FOUND');
  return password;
};
const create = async (body) => {
  const password = { id: uuidv4(), ...body, createdAt: new Date().toISOString() };
  passwords.push(password);
  return password;
};
export default { getAll, getById, create };