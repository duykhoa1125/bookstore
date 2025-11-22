import { Request, Response } from "express";
import { CartService } from "./cart.service";
import { ResponseUtil } from "../../utils/response.util";

export class CartController {
  private cartService = new CartService();

  getCart = async (req: Request, res: Response) => {
    try {
      const cart = await this.cartService.getCart(req.user!.id);
      return ResponseUtil.success(res, cart);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  addToCart = async (req: Request, res: Response) => {
    try {
      const cartItem = await this.cartService.addToCart(req.user!.id, req.body);
      return ResponseUtil.success(res, cartItem, "Item added to cart", 201);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  updateCartItem = async (req: Request, res: Response) => {
    try {
      const cartItem = await this.cartService.updateCartItem(
        req.user!.id,
        req.params.itemId,
        req.body
      );
      return ResponseUtil.success(res, cartItem, "Cart item updated");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  removeFromCart = async (req: Request, res: Response) => {
    try {
      const result = await this.cartService.removeFromCart(
        req.user!.id,
        req.params.itemId
      );
      return ResponseUtil.success(res, result);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  clearCart = async (req: Request, res: Response) => {
    try {
      const result = await this.cartService.clearCart(req.user!.id);
      return ResponseUtil.success(res, result);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };
}