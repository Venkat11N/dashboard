import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/index.js'

interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log( "--- MIDDLEWARE HIT ---");
  const token = req.headers['authorization']?.split(' ')[1];
  console.log("Token found:", token ? "yes" : "No");

  if(!token) {
    return res.status(403).json({
      status: "error",
      message: "Access denied. No token provided."
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    console.log("Token Verified for User:" + (decoded as any).userId);
    next();
  } catch (error) {
    console.log("Token Verification Failed");
    return res.status(401).json({
      status: "error",
      message: "Unauthorized: Invalid or expired token"
    });
  }
};