import { Request, Response } from "express";
import { PaymentMethodService } from "./payment-method.service";
import { ResponseUtil } from "../../utils/response.util";

export class PaymentMethodController {
  private paymentMethodService = new PaymentMethodService();

  create = async (req: Request, res: Response) => {
    try {
      const paymentMethod = await this.paymentMethodService.create(req.body);
      return ResponseUtil.success(
        res,
        paymentMethod,
        "Payment method created successfully",
        201
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findAll = async (req: Request, res: Response) => {
    try {
      const paymentMethods = await this.paymentMethodService.findAll();
      return ResponseUtil.success(
        res,
        paymentMethods,
        "Payment methods fetched successfully"
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findById = async (req: Request, res: Response) => {
    try {
      const paymentMethod = await this.paymentMethodService.findById(
        req.params.id
      );
      return ResponseUtil.success(res, paymentMethod);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 404);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const paymentMethod = await this.paymentMethodService.update(
        req.params.id,
        req.body
      );
      return ResponseUtil.success(
        res,
        paymentMethod,
        "Payment method updated successfully"
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const result = await this.paymentMethodService.delete(req.params.id);
      return ResponseUtil.success(res, result);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };
}
