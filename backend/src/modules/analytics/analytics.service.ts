import prisma from "../../config/database";

export class AnalyticsService {
    /**
     * Get revenue by month for the last N months
     */
    async getRevenueByMonth(months: number = 6) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const payments = await prisma.payment.findMany({
            where: {
                status: "COMPLETED",
                paymentDate: {
                    gte: startDate,
                },
            },
            select: {
                total: true,
                paymentDate: true,
            },
        });

        // Group by month
        const revenueByMonth: Record<string, number> = {};

        for (let i = 0; i < months; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            revenueByMonth[key] = 0;
        }

        payments.forEach((payment) => {
            if (payment.paymentDate) {
                const date = new Date(payment.paymentDate);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                if (revenueByMonth[key] !== undefined) {
                    revenueByMonth[key] += payment.total;
                }
            }
        });

        // Convert to array sorted by date
        return Object.entries(revenueByMonth)
            .map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }

    /**
     * Get orders count by status
     */
    async getOrdersByStatus() {
        const orders = await prisma.order.groupBy({
            by: ["status"],
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
     * Get sales by category
     */
    async getSalesByCategory() {
        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
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
        const salesByCategory: Record<string, { name: string; totalSales: number; itemCount: number }> = {};

        orderItems.forEach((item) => {
            const categoryId = item.book.category.id;
            const categoryName = item.book.category.name;

            if (!salesByCategory[categoryId]) {
                salesByCategory[categoryId] = {
                    name: categoryName,
                    totalSales: 0,
                    itemCount: 0,
                };
            }

            salesByCategory[categoryId].totalSales += item.price * item.quantity;
            salesByCategory[categoryId].itemCount += item.quantity;
        });

        return Object.values(salesByCategory)
            .map((cat) => ({
                ...cat,
                totalSales: Math.round(cat.totalSales * 100) / 100,
            }))
            .sort((a, b) => b.totalSales - a.totalSales);
    }

    /**
     * Get top customers by total spending
     */
    async getTopCustomers(limit: number = 5) {
        const orders = await prisma.order.findMany({
            where: {
                status: {
                    not: "CANCELLED",
                },
                payment: {
                    status: "COMPLETED",
                },
            },
            select: {
                total: true,
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        // Group by user
        const customerSpending: Record<string, { id: string; fullName: string; email: string; totalSpent: number; orderCount: number }> = {};

        orders.forEach((order) => {
            const userId = order.user.id;
            if (!customerSpending[userId]) {
                customerSpending[userId] = {
                    id: userId,
                    fullName: order.user.fullName,
                    email: order.user.email,
                    totalSpent: 0,
                    orderCount: 0,
                };
            }
            customerSpending[userId].totalSpent += order.total;
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
     * Get dashboard overview stats
     */
    async getDashboardStats() {
        const [totalUsers, totalBooks, totalOrders, completedPayments] = await Promise.all([
            prisma.user.count({ where: { role: "USER" } }),
            prisma.book.count(),
            prisma.order.count(),
            prisma.payment.aggregate({
                where: { status: "COMPLETED" },
                _sum: { total: true },
            }),
        ]);

        return {
            totalUsers,
            totalBooks,
            totalOrders,
            totalRevenue: Math.round((completedPayments._sum.total || 0) * 100) / 100,
        };
    }
}

export const analyticsService = new AnalyticsService();
