import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ResponseUtil } from "../utils/response.util";
import { logger } from "../utils/logger.util";

export class ErrorMiddleware {
  static handle(err: Error, req: Request, res: Response, _next: NextFunction) {
    logger.error("Unhandled error", err, {
      method: req.method,
      path: req.path,
      query: req.query,
    });

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        const target =
          Array.isArray(err.meta?.target) && err.meta?.target.length > 0
            ? String(err.meta.target[0])
            : "resource";

        return ResponseUtil.error(res, "Resource already exists", {
          statusCode: 409,
          errors: { [target]: ["Duplicate entry"] },
        });
      }
      if (err.code === "P2025") {
        return ResponseUtil.error(res, "Resource not found", 404);
      }
    }

    return ResponseUtil.error(res, "Internal server error", {
      statusCode: 500,
      errors: err?.message,
    });
  }
}
