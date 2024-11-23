import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../utils/utility.js';



export const isAuthenticated = (req, resp, next) => {
  const token = req.cookies[process.env.COOKIE_NAME]
  if (!token) return next(new ErrorHandler("Please login to access this resource!", 401))
  const decodedData = jwt.verify(token, process.env.JWT_SECRET)
  req.user = decodedData._id
  next()
}

