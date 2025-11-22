import { Router } from "express";
import { CategoryController } from "./category.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { ValidationMiddleware } from "../../middleware/validation.middleware";
import { CreateCategoryDto, UpdateCategoryDto } from "./category.dto";

const router = Router();
const categoryController = new CategoryController();

router.get("/", categoryController.findAll);
router.get("/:id", categoryController.findById);
router.post(
  "/",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("ADMIN"),
  ValidationMiddleware.validate(CreateCategoryDto),
  categoryController.create
);
router.patch(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("ADMIN"),
  ValidationMiddleware.validate(UpdateCategoryDto),
  categoryController.update
);
router.delete(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("ADMIN"),
  categoryController.delete
);

export default router;
