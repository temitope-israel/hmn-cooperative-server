// src/config/database.ts
//
// Prisma automatically reads DATABASE_URL from process.env.
// dotenv.config() is called in src/index.ts before this file
// is ever imported, so the variable is already available here.
// No constructor options needed.

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const db =
  globalThis.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db;
}