import { Request, Response } from "express";
import { RatingService } from "./rating.service";
import { ResponseUtil } from "../../utils/response.util";

export class RatingController {
  private ratingService = new RatingService();

  create = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { replaceIfExists, ...payload } = req.body as any;

      // Check if user already rated this book
      const existing = await this.ratingService.getUserRatingForBook(
        userId,
        payload.bookId
      );

      if (existing && !replaceIfExists) {
        return ResponseUtil.error(res, "You have reviewed this book before. Do you want to update your review?", { statusCode: 409, errors: { code: "RATING_EXISTS", ratingId: existing.id } });
      }

      if (existing && replaceIfExists) {
        const updated = await this.ratingService.update(userId, existing.id, {
          stars: payload.stars,
          content: payload.content,
        });
        return ResponseUtil.success(res, updated, "Rating updated successfully");
      }

      const rating = await this.ratingService.create(userId, payload);
      return ResponseUtil.success(res, rating, "Rating created successfully", 201);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  findByBook = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id; // Optional - works for both authenticated and public
      const ratings = await this.ratingService.findByBook(req.params.bookId, userId);
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
