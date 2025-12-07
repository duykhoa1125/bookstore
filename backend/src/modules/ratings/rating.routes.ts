import { Router } from "express";
import { RatingController } from "./rating.controller";
import { RatingVoteController } from "./rating-vote.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { ValidationMiddleware } from "../../middleware/validation.middleware";
import { CreateRatingDto, UpdateRatingDto } from "./rating.dto";

const router = Router();
const ratingController = new RatingController();
const ratingVoteController = new RatingVoteController();

// Public routes (with optional auth to get user's vote status)
router.get("/book/:bookId", AuthMiddleware.optionalAuthenticate, ratingController.findByBook);
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

// Voting routes (must be authenticated)
router.post("/:id/vote", ratingVoteController.voteRating);
router.delete("/:id/vote", ratingVoteController.removeVote);
router.get("/:id/vote", ratingVoteController.getUserVote);

// Admin routes
router.get("/all", AuthMiddleware.authorize("ADMIN"), ratingController.findAll);

router.delete(
  "/admin/:id",
  AuthMiddleware.authorize("ADMIN"),
  ratingController.deleteByAdmin
);

export default router;

