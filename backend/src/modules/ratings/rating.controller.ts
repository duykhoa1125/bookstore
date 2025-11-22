import { Request, Response } from "express";
import { RatingService } from "./rating.service";
import { ResponseUtil } from "../../utils/response.util";

export class RatingController {
  private ratingService = new RatingService();

  create = async (req: Request, res: Response) => {
    try {
      const rating = await this.ratingService.create(req.user!.id, req.body);
      return ResponseUtil.success(
        res,
        rating,
        "Rating created successfully",
        201
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findByBook = async (req: Request, res: Response) => {
    try {
      const ratings = await this.ratingService.findByBook(req.params.bookId);
      return ResponseUtil.success(res, ratings, "Ratings fetched successfully");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findMyRatings = async (req: Request, res: Response) => {
    try {
      const ratings = await this.ratingService.findByUser(req.user!.id);
      return ResponseUtil.success(
        res,
        ratings,
        "User ratings fetched successfully"
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  getBookAverageRating = async (req: Request, res: Response) => {
    try {
      const result = await this.ratingService.getBookAverageRating(
        req.params.bookId
      );
      return ResponseUtil.success(
        res,
        result,
        "Average rating fetched successfully"
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  getMyRatingForBook = async (req: Request, res: Response) => {
    try {
      const rating = await this.ratingService.getUserRatingForBook(
        req.user!.id,
        req.params.bookId
      );
      return ResponseUtil.success(
        res,
        rating,
        rating
          ? "User rating fetched successfully"
          : "No rating found for this book"
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  // Admin only methods
  findAll = async (req: Request, res: Response) => {
    try {
      const ratings = await this.ratingService.findAll();
      return ResponseUtil.success(
        res,
        ratings,
        "All ratings fetched successfully"
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  deleteByAdmin = async (req: Request, res: Response) => {
    try {
      const result = await this.ratingService.deleteByAdmin(req.params.id);
      return ResponseUtil.success(res, result);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const rating = await this.ratingService.update(
        req.user!.id,
        req.params.id,
        req.body
      );
      return ResponseUtil.success(res, rating, "Rating updated successfully");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const result = await this.ratingService.delete(
        req.user!.id,
        req.params.id
      );
      return ResponseUtil.success(res, result);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };
}
