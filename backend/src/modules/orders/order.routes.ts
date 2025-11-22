import { Router } from "express";
import { OrderController } from "./order.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { ValidationMiddleware } from "../../middleware/validation.middleware";
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  ConfirmOrderDto,
} from "./order.dto";

const router = Router();
const orderController = new OrderController();

router.use(AuthMiddleware.authenticate);

router.post(
  "/",
  ValidationMiddleware.validate(CreateOrderDto),
  orderController.create
);
router.get("/", orderController.findAll);
router.get(
  "/all",
  AuthMiddleware.authorize("ADMIN"),
  orderController.getAllOrders
);
router.get("/:id", orderController.findById);
router.patch(
  "/:id/status",
  AuthMiddleware.authorize("ADMIN"),
  ValidationMiddleware.validate(UpdateOrderStatusDto),
  orderController.updateStatus
);
router.patch(
  "/:id/confirm",
  AuthMiddleware.authorize("ADMIN"),
  ValidationMiddleware.validate(ConfirmOrderDto),
  orderController.confirmOrder
);

export default router;
