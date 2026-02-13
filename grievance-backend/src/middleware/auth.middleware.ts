import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/index.js";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      code: "NO_TOKEN",
      message: "Access token required"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    (req as any).user = decoded;
    next();
  } catch (error: any) {
 
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        code: "TOKEN_EXPIRED",  
        message: "Access token expired"
      });
    }

    return res.status(401).json({
      status: "error",
      code: "INVALID_TOKEN",
      message: "Invalid access token"
    });
  }
};