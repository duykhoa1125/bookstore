import { ResponseUtil } from "../../utils/response.util";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.register(req.body);
      return ResponseUtil.success(
        res,
        result,
        "User registered successfully",
        201
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.login(req.body);
      return ResponseUtil.success(res, result, "Login successful");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 401);
    }
  };

  googleLogin = async (req: Request, res: Response) => {
    try {
      const { credential } = req.body;
      const result = await this.authService.googleLogin(credential);
      return ResponseUtil.success(res, result, "Google login successful");
    } catch (error: any) {
      console.error("Google login error:", error);
      return ResponseUtil.error(res, error.message, 401);
    }
  };

  getProfile = async (req: Request, res: Response) => {
    try {
      const profile = await this.authService.getProfile(req.user!.id);
      return ResponseUtil.success(res, profile);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  updateProfile = async (req: Request, res: Response) => {
    try {
      const profile = await this.authService.updateProfile(
        req.user!.id,
        req.body,
        req.user!.role
      );
      return ResponseUtil.success(res, profile, "Profile updated successfully");
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.forgotPassword(req.body.email);
      return ResponseUtil.success(res, result, result.message);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      const result = await this.authService.resetPassword(token, password);
      return ResponseUtil.success(res, result, result.message);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 400);
    }
  };

  changePassword = async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await this.authService.changePassword(
        req.user!.id,
        currentPassword,
        newPassword
      );
      return ResponseUtil.success(res, result, result.message);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 400);
    }
  };
}
