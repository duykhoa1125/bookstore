import { Response } from "express";

export class ResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    message: string,
    statusCodeOrOptions?: number | { statusCode?: number; errors?: any }
  ) {
    let statusCode = 400;
    let errors: any = undefined;

    if (typeof statusCodeOrOptions === "number") {
      statusCode = statusCodeOrOptions;
    } else if (statusCodeOrOptions) {
      statusCode = statusCodeOrOptions.statusCode || 400;
      errors = statusCodeOrOptions.errors;
    }

    const response: any = {
      success: false,
      message,
      data: null,
    };

    if (errors !== undefined) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }
}
