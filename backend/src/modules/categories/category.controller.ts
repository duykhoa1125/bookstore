import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import { ResponseUtil } from "../../utils/response.util";

export class CategoryController {
  private categoryService = new CategoryService();

  create = async (req: Request, res: Response) => {
    try {
      const category = await this.categoryService.create(req.body);
      return ResponseUtil.success(
        res,
        category,
        "Category created successfully",
        201
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findAll = async (req: Request, res: Response) => {
    try {
      const categories = await this.categoryService.findAll();
      return ResponseUtil.success(res, categories);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findById = async (req: Request, res: Response) => {
    try {
      const category = await this.categoryService.findById(req.params.id);
      return ResponseUtil.success(res, category);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 404);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const category = await this.categoryService.update(
        req.params.id,
        req.body
      );
      return ResponseUtil.success(
        res,
        category,
        "Category updated successfully"
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const result = await this.categoryService.delete(req.params.id);
      return ResponseUtil.success(res, result);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };
}
