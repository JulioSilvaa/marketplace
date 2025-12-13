import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

console.log("🔍 DATABASE_URL:", connectionString);

if (!connectionString) {
  throw new Error(
    "DATABASE_URL não está definida. Verifique seu arquivo .env ou variáveis de ambiente do Docker."
  );
}

console.log("✅ Criando Pool do PostgreSQL...");
const pool = new Pool({ connectionString });

console.log("✅ Criando adapter PrismaPg...");
const adapter = new PrismaPg(pool);

console.log("✅ Criando PrismaClient...");
const prisma = new PrismaClient({ adapter });

console.log("✅ Prisma configurado com sucesso!");

export { prisma };
