import app from "./app";
import { ENV } from "./config/env";
import prisma from "./config/database";
import { logger } from "./utils/logger.util";

const PORT = ENV.PORT;

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");

    app.listen(PORT, () => {
      logger.info(`Server started`, {
        port: PORT,
        environment: ENV.NODE_ENV,
        healthCheck: `http://localhost:${PORT}/health`,
      });
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

