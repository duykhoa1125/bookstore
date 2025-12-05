import { Router } from "express";
import { AuthController } from "./auth.controller";
import { ValidationMiddleware } from "../../middleware/validation.middleware";
import { LoginDto, RegisterDto, UpdateUserDto } from "./auth.dto";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { GoogleAuthDto } from "./google-auth.dto";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  ValidationMiddleware.validate(RegisterDto),
  authController.register
);

router.post(
  "/login",
  ValidationMiddleware.validate(LoginDto),
  authController.login
);

// Google OAuth route
router.post(
  "/google",
  ValidationMiddleware.validate(GoogleAuthDto),
  authController.googleLogin
);


router.get("/profile", AuthMiddleware.authenticate, authController.getProfile);

router.put(
  "/profile",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validate(UpdateUserDto),
  authController.updateProfile
);

export default router;
