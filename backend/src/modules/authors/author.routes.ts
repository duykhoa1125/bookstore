import { Router } from "express";
import { AuthorController } from "./author.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { ValidationMiddleware } from "../../middleware/validation.middleware";
import { CreateAuthorDto, UpdateAuthorDto } from "./author.dto";

const router = Router();
const authorController = new AuthorController();

router.get("/", authorController.findAll);
router.get("/:id", authorController.findById);
router.post(
  "/",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("ADMIN"),
  ValidationMiddleware.validate(CreateAuthorDto),
  authorController.create
);
router.patch(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("ADMIN"),
  ValidationMiddleware.validate(UpdateAuthorDto),
  authorController.update
);
router.delete(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("ADMIN"),
  authorController.delete
);

export default router;
