import { Router } from "express";
import { BookController } from "./book.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { ValidationMiddleware } from "../../middleware/validation.middleware";
import { CreateBookDto, UpdateBookDto } from "./book.dto";

const router = Router();
const bookController = new BookController();

router.get("/", bookController.findAll);
router.get("/:id", bookController.findById);
router.get("/:id/related", bookController.getRelatedBooks);
router.post(
  "/",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("ADMIN"),
  ValidationMiddleware.validate(CreateBookDto),
  bookController.create
);
router.patch(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("ADMIN"),
  ValidationMiddleware.validate(UpdateBookDto),
  bookController.update
);
router.delete(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("ADMIN"),
  bookController.delete
);

export default router;
