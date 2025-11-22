import { Router } from "express";
import { RatingController } from "./rating.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { ValidationMiddleware } from "../../middleware/validation.middleware";
import { CreateRatingDto, UpdateRatingDto } from "./rating.dto";

const router = Router();
const ratingController = new RatingController();

// Public routes
router.get("/book/:bookId", ratingController.findByBook);
router.get("/book/:bookId/average", ratingController.getBookAverageRating);

// Protected routes (user must be authenticated)
router.use(AuthMiddleware.authenticate);

router.get("/my-ratings", ratingController.findMyRatings);
router.get("/my-rating/:bookId", ratingController.getMyRatingForBook);

router.post(
  "/",
  ValidationMiddleware.validate(CreateRatingDto),
  ratingController.create
);

router.patch(
  "/:id",
  ValidationMiddleware.validate(UpdateRatingDto),
  ratingController.update
);

router.delete("/:id", ratingController.delete);

// Admin routes
router.get("/all", AuthMiddleware.authorize("ADMIN"), ratingController.findAll);

router.delete(
  "/admin/:id",
  AuthMiddleware.authorize("ADMIN"),
  ratingController.deleteByAdmin
);

export default router;
