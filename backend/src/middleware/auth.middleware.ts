import { Request, Response, NextFunction } from "express";
import { JwtUtil } from "../utils/jwt.util";
import { ResponseUtil } from "../utils/response.util";

export class AuthMiddleware {
  static authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return ResponseUtil.error(res, "No token provided", 401);
      }

      const decoded = JwtUtil.verify(token);
      req.user = decoded;

      next();
    } catch (error) {
      return ResponseUtil.error(res, "Invalid or expired token", 401);
    }
  }

  static authorize(...roles: string[]){
    return (req: Request, res: Response, next: NextFunction) => {
        if(!req.user){
            return ResponseUtil.error(res, "Unauthorized", 401);
        }

        if(!roles.includes(req.user.role)){
            return ResponseUtil.error(res, "Forbidden", 403);
        }
        next();
    }
  }
}
