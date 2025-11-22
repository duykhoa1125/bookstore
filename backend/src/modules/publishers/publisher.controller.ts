import { Request, Response } from "express";
import { PublisherService } from "./publisher.service";
import { ResponseUtil } from "../../utils/response.util";

export class PublisherController {
  private publisherService = new PublisherService();

  create = async (req: Request, res: Response) => {
    try {
      const publisher = await this.publisherService.create(req.body);
      return ResponseUtil.success(res, publisher, "Publisher created", 201);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findAll = async (req: Request, res: Response) => {
    try {
      const publishers = await this.publisherService.findAll();
      return ResponseUtil.success(res, publishers);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findById = async (req: Request, res: Response) => {
    try {
      const publisher = await this.publisherService.findById(req.params.id);
      return ResponseUtil.success(res, publisher);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 404);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const publisher = await this.publisherService.update(
        req.params.id,
        req.body
      );
      return ResponseUtil.success(res, publisher, "Publisher updated");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const result = await this.publisherService.delete(req.params.id);
      return ResponseUtil.success(res, result);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };
}
