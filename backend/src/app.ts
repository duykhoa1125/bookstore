import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";

import { ENV } from "./config/env";
import { ErrorMiddleware } from "./middleware/error.middleware";
import { ResponseUtil } from "./utils/response.util";

import authRoutes from "./modules/auth/auth.routes";
import bookRoutes from "./modules/books/book.routes";
import categoryRoutes from "./modules/categories/category.routes";
import cartRoutes from "./modules/cart/cart.routes";
import orderRoutes from "./modules/orders/order.routes";
import ratingRoutes from "./modules/ratings/rating.routes";
import publisherRoutes from "./modules/publishers/publisher.routes";
import authorRoutes from "./modules/authors/author.routes";
import paymentMethodRoutes from "./modules/payment-methods/payment-method.routes";
import paymentRoutes from "./modules/payments/payment.routes";
import userRoutes from "./modules/users/user.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import uploadRoutes from "./modules/upload/upload.routes";

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow all origins in development
      if (ENV.NODE_ENV === 'development') {
        return callback(null, true);
      }

      if (!origin) return callback(null, true);

      const allowedOrigins = ENV.CORS_ALLOWED_ORIGINS;

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) =>
  ResponseUtil.success(res, { status: "ok" }, "Service is healthy")
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/publishers", publisherRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/upload", uploadRoutes);

// 404 handler
app.use((req, res) => ResponseUtil.error(res, "Route not found", 404));

// Error handler
app.use(ErrorMiddleware.handle);

export default app;
