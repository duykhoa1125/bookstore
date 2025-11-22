import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { ValidationMiddleware } from "../../middleware/validation.middleware";
import { ProcessPaymentDto } from "./payment.dto";

const router = Router();
const paymentController = new PaymentController();

router.post(
  "/:id/process",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validate(ProcessPaymentDto),
  paymentController.processPayment
);

export default router;
