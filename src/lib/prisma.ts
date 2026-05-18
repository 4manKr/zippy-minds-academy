import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const isTurso = process.env.TURSO_DATABASE_URL?.startsWith("libsql://");

  const adapter = new PrismaLibSql(
    isTurso
      ? {
          url:       process.env.TURSO_DATABASE_URL!,
          authToken: process.env.TURSO_AUTH_TOKEN!,
        }
      : {
          // Local SQLite — absolute path so it works from any CWD
          url: `file:${path.resolve(process.cwd(), "dev.db")}`,
        }
  );

  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
