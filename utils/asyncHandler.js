// Wraps async route handlers — forwards any thrown error to next(err)
// so Express's global errorHandler catches it instead of crashing the process
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
export default asyncHandler;
