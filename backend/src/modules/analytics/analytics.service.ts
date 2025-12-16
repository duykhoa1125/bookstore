import prisma from "../../config/database";

type TimeRange = "6M" | "30D" | "7D" | "Yesterday";

export class AnalyticsService {
    /**
     * Get date range based on timeRange parameter
     */
    private getDateRange(timeRange: TimeRange): { startDate: Date; endDate: Date } {
        const now = new Date();
        const endDate = new Date();
        let startDate = new Date();

        switch (timeRange) {
            case "6M":
                startDate.setMonth(now.getMonth() - 6);
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case "30D":
                startDate.setDate(now.getDate() - 30);
                startDate.setHours(0, 0, 0, 0);
                break;
            case "7D":
                startDate.setDate(now.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
                break;
            case "Yesterday":
                startDate.setDate(now.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setDate(now.getDate() - 1);
                endDate.setHours(23, 59, 59, 999);
                break;
        }

        return { startDate, endDate };
    }

    /**
     * Get revenue data grouped by time period
     * Returns data in format ready for frontend charts
     */
    async getRevenueByTimeRange(timeRange: TimeRange = "6M") {
        const { startDate, endDate } = this.getDateRange(timeRange);
        const now = new Date();

        // Get all orders with completed payments in date range
        const orders = await prisma.order.findMany({
            where: {
                orderDate: {
                    gte: startDate,
                    lte: endDate,
                },
                payment: {
                    status: "COMPLETED",
                },
            },
            select: {
                orderDate: true,
                payment: {
                    select: {
                        total: true,
                    },
                },
            },
        });

        // Initialize revenue map based on time range
        const revenueMap = new Map<string, number>();

        if (timeRange === "6M") {
            // Monthly grouping
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(now.getMonth() - i);
                const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
                revenueMap.set(key, 0);
            }
        } else if (timeRange === "30D" || timeRange === "7D") {
            // Daily grouping
            const days = timeRange === "30D" ? 30 : 7;
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                revenueMap.set(key, 0);
            }
        } else if (timeRange === "Yesterday") {
            // Hourly grouping
            for (let i = 0; i < 24; i++) {
                const key = `${i.toString().padStart(2, "0")}:00`;
                revenueMap.set(key, 0);
            }
        }

        // Aggregate revenue
        orders.forEach((order) => {
            const date = new Date(order.orderDate);
            let key = "";

            if (timeRange === "6M") {
                key = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
            } else if (timeRange === "30D" || timeRange === "7D") {
                key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            } else if (timeRange === "Yesterday") {
                key = `${date.getHours().toString().padStart(2, "0")}:00`;
            }

            if (revenueMap.has(key) && order.payment) {
                revenueMap.set(key, (revenueMap.get(key) || 0) + order.payment.total);
            }
        });

        // Convert to array format expected by frontend
        return Array.from(revenueMap.entries()).map(([monthDisplay, revenue]) => ({
            monthDisplay,
            revenue: Math.round(revenue * 100) / 100,
        }));
    }

    /**
     * Get orders count by status within time range
     */
    async getOrdersByStatus(timeRange: TimeRange = "6M") {
        const { startDate, endDate } = this.getDateRange(timeRange);

        const orders = await prisma.order.groupBy({
            by: ["status"],
            where: {
                orderDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _count: {
                id: true,
            },
        });

        return orders.map((item) => ({
            status: item.status,
            count: item._count.id,
        }));
    }

    /**
     * Get sales by category within time range
     */
    async getSalesByCategory(timeRange: TimeRange = "6M") {
        const { startDate, endDate } = this.getDateRange(timeRange);

        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
                    orderDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                    status: {
                        not: "CANCELLED",
                    },
                },
            },
            select: {
                quantity: true,
                price: true,
                book: {
                    select: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        // Group by category
        const salesByCategory: Record<string, { name: string; totalSales: number }> = {};

        orderItems.forEach((item) => {
            const categoryId = item.book.category.id;
            const categoryName = item.book.category.name;

            if (!salesByCategory[categoryId]) {
                salesByCategory[categoryId] = {
                    name: categoryName,
                    totalSales: 0,
                };
            }

            salesByCategory[categoryId].totalSales += item.price * item.quantity;
        });

        return Object.values(salesByCategory)
            .map((cat) => ({
                ...cat,
                totalSales: Math.round(cat.totalSales * 100) / 100,
            }))
            .sort((a, b) => b.totalSales - a.totalSales);
    }

    /**
     * Get top customers by total spending within time range
     */
    async getTopCustomers(limit: number = 5, timeRange: TimeRange = "6M") {
        const { startDate, endDate } = this.getDateRange(timeRange);

        const orders = await prisma.order.findMany({
            where: {
                orderDate: {
                    gte: startDate,
                    lte: endDate,
                },
                status: {
                    not: "CANCELLED",
                },
                payment: {
                    status: "COMPLETED",
                },
            },
            select: {
                payment: {
                    select: {
                        total: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });

        // Group by user
        const customerSpending: Record<string, { id: string; fullName: string; totalSpent: number; orderCount: number }> = {};

        orders.forEach((order) => {
            const userId = order.user.id;
            if (!customerSpending[userId]) {
                customerSpending[userId] = {
                    id: userId,
                    fullName: order.user.fullName,
                    totalSpent: 0,
                    orderCount: 0,
                };
            }
            if (order.payment) {
                customerSpending[userId].totalSpent += order.payment.total;
            }
            customerSpending[userId].orderCount += 1;
        });

        return Object.values(customerSpending)
            .map((c) => ({
                ...c,
                totalSpent: Math.round(c.totalSpent * 100) / 100,
            }))
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, limit);
    }

    /**
     * Get dashboard overview stats for time range
     */
    async getDashboardStats(timeRange: TimeRange = "6M") {
        const { startDate, endDate } = this.getDateRange(timeRange);

        // Get orders in time range
        const orders = await prisma.order.findMany({
            where: {
                orderDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                userId: true,
                payment: {
                    select: {
                        status: true,
                        total: true,
                    },
                },
            },
        });

        // Calculate stats
        const totalOrders = orders.length;
        const uniqueCustomerIds = new Set<string>();
        let totalRevenue = 0;

        orders.forEach((order) => {
            if (order.userId) {
                uniqueCustomerIds.add(order.userId);
            }
            if (order.payment?.status === "COMPLETED") {
                totalRevenue += order.payment.total;
            }
        });

        // Low stock books (not time dependent)
        const lowStockBooks = await prisma.book.count({
            where: {
                stock: {
                    lt: 10,
                },
            },
        });

        return {
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            uniqueCustomers: uniqueCustomerIds.size,
            totalOrders,
            lowStockBooks,
        };
    }

    /**
     * Get recent orders within time range
     */
    async getRecentOrders(limit: number = 5, timeRange: TimeRange = "6M") {
        const { startDate, endDate } = this.getDateRange(timeRange);

        const orders = await prisma.order.findMany({
            where: {
                orderDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                orderDate: "desc",
            },
            take: limit,
            select: {
                id: true,
                orderDate: true,
                status: true,
                total: true,
                user: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });

        return orders;
    }

    /**
     * Get top selling books within time range
     */
    async getTopSellingBooks(limit: number = 4, timeRange: TimeRange = "6M") {
        const { startDate, endDate } = this.getDateRange(timeRange);

        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
                    orderDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                    status: {
                        not: "CANCELLED",
                    },
                },
            },
            select: {
                quantity: true,
                bookId: true,
                book: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        imageUrl: true,
                        authors: {
                            select: {
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // Group by book and sum quantities
        const salesMap: Record<string, { quantity: number; book: any }> = {};

        orderItems.forEach((item) => {
            if (!salesMap[item.bookId]) {
                salesMap[item.bookId] = {
                    quantity: 0,
                    book: item.book,
                };
            }
            salesMap[item.bookId].quantity += item.quantity;
        });

        return Object.values(salesMap)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, limit)
            .map((entry) => ({
                ...entry.book,
                sold: entry.quantity,
            }));
    }

    /**
     * Get books with low stock
     */
    async getLowStockBooks(threshold: number = 10) {
        const books = await prisma.book.findMany({
            where: {
                stock: {
                    lt: threshold,
                },
            },
            select: {
                id: true,
                title: true,
                stock: true,
                imageUrl: true,
            },
            orderBy: {
                stock: "asc",
            },
        });

        return books;
    }
}

export const analyticsService = new AnalyticsService();
