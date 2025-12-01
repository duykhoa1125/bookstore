import { Request, Response } from "express";
import { BookService } from "./book.service";
import { ResponseUtil } from "../../utils/response.util";

export class BookController {
  private bookService = new BookService();

  create = async (req: Request, res: Response) => {
    try {
      const book = await this.bookService.create(req.body);
      ResponseUtil.success(res, book, "Book created successfully", 201);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findAll = async (req: Request, res: Response) => {
    try {
      const { categoryId, search, sortBy, order } = req.query;
      const books = await this.bookService.findAll({
        categoryId: categoryId as string,
        search: search as string,
        sortBy: (sortBy as string) as any,
        order: (order as string) as any,
      });
      return ResponseUtil.success(res, books, "Books fetched successfully");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findById = async (req: Request, res: Response) => {
    try {
      const book = await this.bookService.findById(req.params.id);
      return ResponseUtil.success(res, book);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 404);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const book = await this.bookService.update(req.params.id, req.body);
      return ResponseUtil.success(res, book, "Book updated successfully");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const result = await this.bookService.delete(req.params.id);
      return ResponseUtil.success(res, result);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };
}
