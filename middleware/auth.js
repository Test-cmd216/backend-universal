import jwt from 'jsonwebtoken';

// Protects routes — usage: router.get('/secret', protect, controller.getAll)
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided. Please log in.' });
    }
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Token expired. Please refresh or log in again.'
      : 'Invalid token. Please log in again.';
    return res.status(401).json({ success: false, message: msg });
  }
};
export default protect;
