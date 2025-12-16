import { Request, Response } from "express";
import { analyticsService } from "./analytics.service";

type TimeRange = "6M" | "30D" | "7D" | "Yesterday";

const isValidTimeRange = (value: any): value is TimeRange => {
    return ["6M", "30D", "7D", "Yesterday"].includes(value);
};

export class AnalyticsController {
    async getRevenueByTimeRange(req: Request, res: Response) {
        try {
            const timeRange = isValidTimeRange(req.query.timeRange)
                ? req.query.timeRange
                : "6M";
            const data = await analyticsService.getRevenueByTimeRange(timeRange);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to fetch revenue data" });
        }
    }

    async getOrdersByStatus(req: Request, res: Response) {
        try {
            const timeRange = isValidTimeRange(req.query.timeRange)
                ? req.query.timeRange
                : "6M";
            const data = await analyticsService.getOrdersByStatus(timeRange);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to fetch orders by status" });
        }
    }

    async getSalesByCategory(req: Request, res: Response) {
        try {
            const timeRange = isValidTimeRange(req.query.timeRange)
                ? req.query.timeRange
                : "6M";
            const data = await analyticsService.getSalesByCategory(timeRange);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to fetch sales by category" });
        }
    }

    async getTopCustomers(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 5;
            const timeRange = isValidTimeRange(req.query.timeRange)
                ? req.query.timeRange
                : "6M";
            const data = await analyticsService.getTopCustomers(limit, timeRange);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to fetch top customers" });
        }
    }

    async getDashboardStats(req: Request, res: Response) {
        try {
            const timeRange = isValidTimeRange(req.query.timeRange)
                ? req.query.timeRange
                : "6M";
            const data = await analyticsService.getDashboardStats(timeRange);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to fetch dashboard stats" });
        }
    }

    async getRecentOrders(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 5;
            const timeRange = isValidTimeRange(req.query.timeRange)
                ? req.query.timeRange
                : "6M";
            const data = await analyticsService.getRecentOrders(limit, timeRange);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to fetch recent orders" });
        }
    }

    async getTopSellingBooks(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 4;
            const timeRange = isValidTimeRange(req.query.timeRange)
                ? req.query.timeRange
                : "6M";
            const data = await analyticsService.getTopSellingBooks(limit, timeRange);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to fetch top selling books" });
        }
    }

    async getLowStockBooks(req: Request, res: Response) {
        try {
            const threshold = parseInt(req.query.threshold as string) || 10;
            const data = await analyticsService.getLowStockBooks(threshold);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to fetch low stock books" });
        }
    }
}

export const analyticsController = new AnalyticsController();
