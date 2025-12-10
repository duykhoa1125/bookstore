import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaBase =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

export const prisma = prismaBase.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const MAX_RETRIES = 3;
        const RETRY_DELAY = 1000; // 1 second

        let retries = 0;
        while (true) {
          try {
            return await query(args);
          } catch (error: any) {
            // Check for connection-related errors
            // P1001: Can't reach database server
            // P1002: The database server was reached but timed out
            // P5001: This request could not be understood by the server
            // Error { kind: Closed, cause: None }: Neon specific hibernation error
            const isConnectionError =
              error?.code === "P1001" ||
              error?.code === "P1002" ||
              error?.code === "P5001" ||
              (error?.message &&
                error.message.includes(
                  "Error in PostgreSQL connection: Error { kind: Closed, cause: None }"
                ));

            if (isConnectionError && retries < MAX_RETRIES) {
              retries++;
              console.warn(
                `Database connection failed. Retrying... (${retries}/${MAX_RETRIES})`
              );
              await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
              continue; // Retry the loop
            }

            throw error; // Rethrow if not a connection error or max retries reached
          }
        }
      },
    },
  },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaBase;

export default prisma;
