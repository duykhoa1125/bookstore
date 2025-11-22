import { Router } from "express";
import { PaymentMethodController } from "./payment-method.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { ValidationMiddleware } from "../../middleware/validation.middleware";
import {
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
} from "./payment-method.dto";

const router = Router();
const paymentMethodController = new PaymentMethodController();

// Public route - users need to see available payment methods when creating orders
router.get("/", paymentMethodController.findAll);
router.get("/:id", paymentMethodController.findById);

// Admin only routes
router.post(
  "/",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("ADMIN"),
  ValidationMiddleware.validate(CreatePaymentMethodDto),
  paymentMethodController.create
);

router.patch(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("ADMIN"),
  ValidationMiddleware.validate(UpdatePaymentMethodDto),
  paymentMethodController.update
);

router.delete(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("ADMIN"),
  paymentMethodController.delete
);

export default router;
