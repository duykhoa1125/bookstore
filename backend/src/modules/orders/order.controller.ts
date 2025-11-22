import { Request, Response } from "express";
import { OrderService } from "./order.service";
import { ResponseUtil } from "../../utils/response.util";

export class OrderController {
  private orderService = new OrderService();

  create = async (req: Request, res: Response) => {
    try {
      const order = await this.orderService.create(req.user!.id, req.body);
      return ResponseUtil.success(
        res,
        order,
        "Order created successfully",
        201
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findAll = async (req: Request, res: Response) => {
    try {
      const orders = await this.orderService.findAll(req.user!.id);
      return ResponseUtil.success(res, orders, "Orders fetched successfully");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findById = async (req: Request, res: Response) => {
    try {
      const order = await this.orderService.findById(
        req.user!.id,
        req.params.id
      );
      return ResponseUtil.success(res, order);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 404);
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const order = await this.orderService.updateStatus(
        req.params.id,
        req.body
      );
      return ResponseUtil.success(res, order, "Order status updated");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  getAllOrders = async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      const orders = await this.orderService.getAllOrders({
        status: status as string,
      });
      return ResponseUtil.success(res, orders, "Orders fetched successfully");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  confirmOrder = async (req: Request, res: Response) => {
    try {
      const order = await this.orderService.confirmOrder(
        req.params.id,
        req.user!.id,
        req.body
      );
      return ResponseUtil.success(res, order, "Order confirmed by admin");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };
}
