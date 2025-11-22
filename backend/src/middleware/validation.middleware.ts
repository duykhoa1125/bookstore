import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { ResponseUtil } from "../utils/response.util";

export class ValidationMiddleware {
  static validate(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error: unknown) {
        const formattedErrors: Record<string, string[]> = {};

        if (error instanceof ZodError) {
          for (const issue of error.issues) {
            const key =
              issue.path && issue.path.length > 0
                ? issue.path.join(".")
                : "general";

            if (!formattedErrors[key]) {
              formattedErrors[key] = [];
            }

            formattedErrors[key].push(issue.message);
          }
        }

        return ResponseUtil.error(res, "Validation failed", {
          statusCode: 400,
          errors:
            Object.keys(formattedErrors).length > 0
              ? formattedErrors
              : undefined,
        });
      }
    };
  }
}
