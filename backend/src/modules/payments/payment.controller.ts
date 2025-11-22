import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { ResponseUtil } from "../../utils/response.util";

export class PaymentController {
  private paymentService = new PaymentService();

  processPayment = async (req: Request, res: Response) => {
    try {
      const result = await this.paymentService.processPayment(
        req.user!.id,
        req.params.id,
        req.body
      );
      return ResponseUtil.success(
        res,
        result,
        `Payment ${req.body.status.toLowerCase()} successfully`
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };
}
