import { Request, Response } from "express";
import { AuthorService } from "./author.service";
import { ResponseUtil } from "../../utils/response.util";

export class AuthorController {
  private authorService = new AuthorService();

  create = async (req: Request, res: Response) => {
    try {
      const author = await this.authorService.create(req.body);
      return ResponseUtil.success(res, author, "Author created", 201);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findAll = async (req: Request, res: Response) => {
    try {
      const authors = await this.authorService.findAll();
      return ResponseUtil.success(res, authors);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findById = async (req: Request, res: Response) => {
    try {
      const author = await this.authorService.findById(req.params.id);
      return ResponseUtil.success(res, author);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 404);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const author = await this.authorService.update(req.params.id, req.body);
      return ResponseUtil.success(res, author, "Author updated");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const result = await this.authorService.delete(req.params.id);
      return ResponseUtil.success(res, result);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };
}
