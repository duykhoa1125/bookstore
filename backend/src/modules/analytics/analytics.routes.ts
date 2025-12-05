import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// All analytics routes require admin authentication
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize("ADMIN"));

router.get("/revenue-by-month", analyticsController.getRevenueByMonth);
router.get("/orders-by-status", analyticsController.getOrdersByStatus);
router.get("/sales-by-category", analyticsController.getSalesByCategory);
router.get("/top-customers", analyticsController.getTopCustomers);
router.get("/dashboard-stats", analyticsController.getDashboardStats);

export default router;
