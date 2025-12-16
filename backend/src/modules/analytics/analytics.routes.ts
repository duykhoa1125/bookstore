import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// All analytics routes require admin authentication
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize("ADMIN"));

// Revenue data (supports timeRange: 6M, 30D, 7D, Yesterday)
router.get("/revenue", analyticsController.getRevenueByTimeRange);

// Orders by status (supports timeRange)
router.get("/orders-by-status", analyticsController.getOrdersByStatus);

// Sales by category (supports timeRange)
router.get("/sales-by-category", analyticsController.getSalesByCategory);

// Top customers (supports limit and timeRange)
router.get("/top-customers", analyticsController.getTopCustomers);

// Dashboard stats (supports timeRange)
router.get("/dashboard-stats", analyticsController.getDashboardStats);

// Recent orders (supports limit and timeRange)
router.get("/recent-orders", analyticsController.getRecentOrders);

// Top selling books (supports limit and timeRange)
router.get("/top-selling-books", analyticsController.getTopSellingBooks);

// Low stock books (supports threshold)
router.get("/low-stock-books", analyticsController.getLowStockBooks);

export default router;
