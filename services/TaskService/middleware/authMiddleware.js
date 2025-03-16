import jwt from 'jsonwebtoken';
import { ResponseHandler } from '../utils/responseHandler.js';

/**
 * Middleware to authenticate user based on JWT token
 */
export const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseHandler.error(res, 'Authorization token required', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token using HS256 and Base64-encoded secret
    const decoded = jwt.verify(token, Buffer.from(process.env.JWT_SECRET, 'base64'));

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ResponseHandler.error(res, 'Token expired', 401);
    }

    return ResponseHandler.error(res, `Invalid token: ${error.message}`, 401);
  }
};
