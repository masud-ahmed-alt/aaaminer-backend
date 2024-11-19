import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

export const isAuthenticated = (req, resp, next) => {
  const token = req.cookies[process.env.COOKIE_NAME]
  if (!token) return next(new ErrorHandler("Please login to access this resource!", 401))
  const decodedData = jwt.verify(token, process.env.JWT_SECRET)
  req.user = decodedData._id
  next()
}
export default authMiddleware;
