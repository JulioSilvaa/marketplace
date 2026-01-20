import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Equipment Categories...");

  const equipmentCategories = [
    "Som e Iluminação",
    "Mesas e Cadeiras",
    "Tendas e Coberturas",
    "Brinquedos e Infláveis",
    "Geradores",
    "Palco e Estrutura",
    "Telões e Projetores"
  ];

  for (const name of equipmentCategories) {
    const exists = await prisma.categories.findFirst({ where: { name } });
    if (!exists) {
      await prisma.categories.create({ data: { name } });
      console.log(`Created: ${name}`);
    } else {
      console.log(`Exists: ${name}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
