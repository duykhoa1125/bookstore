import { Router } from "express";
import { CartController } from "./cart.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { ValidationMiddleware } from "../../middleware/validation.middleware";
import { AddToCartDto, UpdateCartItemDto } from "./cart.dto";

const router = Router();
const cartController = new CartController();

router.use(AuthMiddleware.authenticate);

router.get("/", cartController.getCart);
router.post(
  "/",
  ValidationMiddleware.validate(AddToCartDto),
  cartController.addToCart
);
router.patch(
  "/items/:itemId",
  ValidationMiddleware.validate(UpdateCartItemDto),
  cartController.updateCartItem
);
router.delete("/items/:itemId", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

export default router;