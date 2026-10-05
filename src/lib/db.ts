import { PrismaClient } from "@prisma/client";

// El hash de contraseña nunca sale en consultas normales; el login lo pide con omit: { passwordHash: false }.
function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    omit: { usuario: { passwordHash: true } },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
