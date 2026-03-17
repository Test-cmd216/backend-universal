import asyncHandler from '../utils/asyncHandler.js';
import userService from '../services/userService.js';
const getAll = asyncHandler(async (req, res) => {
  const data = await userService.getAll();
  res.json({ success: true, count: data.length, data });
});
const get = asyncHandler(async (req, res) => {
  const data = await userService.get(req.params.id);
  res.json({ success: true, data });
});
const create = asyncHandler(async (req, res) => {
  const data = await userService.create(req.body);
  res.status(201).json({ success: true, data });
});
const update = asyncHandler(async (req, res) => {
  const data = await userService.update(req.params.id, req.body);
  res.json({ success: true, data });
});
const deleteItem = asyncHandler(async (req, res) => {
  await userService.delete(req.params.id);
  res.status(204).json({ success: true });
});
export default { getAll, get, create, update, delete: deleteItem };