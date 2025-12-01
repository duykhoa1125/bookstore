import { Router } from "express";
import { UserController } from "./user.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { ValidationMiddleware } from "../../middleware/validation.middleware";
import { UpdateUserDto } from "./user.dto";

const router = Router();
const userController = new UserController();

// All user management routes are admin-protected
router.use(AuthMiddleware.authenticate, AuthMiddleware.authorize("ADMIN"));

router.get("/", userController.findAll);
router.get("/:id", userController.findById);
router.patch("/:id", ValidationMiddleware.validate(UpdateUserDto), userController.update);
router.delete("/:id", userController.delete);

export default router;
