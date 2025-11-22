import app from "./app";
import { ENV } from "./config/env";
import prisma from "./config/database";

const PORT = ENV.PORT;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${ENV.NODE_ENV}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("\n Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
