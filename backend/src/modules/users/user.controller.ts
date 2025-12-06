import { Request, Response } from "express";
import { UserService } from "./user.service";
import { ResponseUtil } from "../../utils/response.util";

export class UserController {
  private userService = new UserService();

  findAll = async (_req: Request, res: Response) => {
    try {
      const users = await this.userService.findAll();
      return ResponseUtil.success(res, users, "Users fetched successfully");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findById = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.findById(req.params.id);
      if (!user) return ResponseUtil.error(res, "User not found", 404);
      return ResponseUtil.success(res, user, "User fetched successfully");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const existing = await this.userService.findById(req.params.id);
      if (!existing) return ResponseUtil.error(res, "User not found", 404);
      const updated = await this.userService.update(req.params.id, req.body);
      return ResponseUtil.success(res, updated, "User updated successfully");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const existing = await this.userService.findById(req.params.id);
      if (!existing) return ResponseUtil.error(res, "User not found", 404);
      const result = await this.userService.delete(req.params.id);
      return ResponseUtil.success(res, result);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };
}
