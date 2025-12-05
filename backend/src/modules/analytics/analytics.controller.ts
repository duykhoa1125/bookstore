import { Request, Response } from "express";
import { analyticsService } from "./analytics.service";

export class AnalyticsController {
    async getRevenueByMonth(req: Request, res: Response) {
        try {
            const months = parseInt(req.query.months as string) || 6;
            const data = await analyticsService.getRevenueByMonth(months);
            res.json({ success: true, data });
        } catch (error) {
            console.error("Error getting revenue by month:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getOrdersByStatus(req: Request, res: Response) {
        try {
            const data = await analyticsService.getOrdersByStatus();
            res.json({ success: true, data });
        } catch (error) {
            console.error("Error getting orders by status:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getSalesByCategory(req: Request, res: Response) {
        try {
            const data = await analyticsService.getSalesByCategory();
            res.json({ success: true, data });
        } catch (error) {
            console.error("Error getting sales by category:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getTopCustomers(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 5;
            const data = await analyticsService.getTopCustomers(limit);
            res.json({ success: true, data });
        } catch (error) {
            console.error("Error getting top customers:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getDashboardStats(req: Request, res: Response) {
        try {
            const data = await analyticsService.getDashboardStats();
            res.json({ success: true, data });
        } catch (error) {
            console.error("Error getting dashboard stats:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
}

export const analyticsController = new AnalyticsController();
