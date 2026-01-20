
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
  console.log("Updating types...");

  // Update Services
  await prisma.spaces.updateMany({
    where: {
      category: {
        name: { in: ['DJ', 'Buffet', 'Segurança', 'Fotógrafo', 'Animação', 'Bartender', 'Decoração', 'Som', 'Iluminação'] }
      }
    },
    data: {
      type: 'SERVICE'
    }
  });
  console.log("Updated SERVICES");

  // Update Equipment (if any)
  // For now assuming Som/Iluminação are services based on seed, but if they were rental items...
  // Let's stick to Service for now as per seed.

  // Update Spaces (Default, but good to ensure)
  await prisma.spaces.updateMany({
    where: {
      category: {
        name: { notIn: ['DJ', 'Buffet', 'Segurança', 'Fotógrafo', 'Animação', 'Bartender', 'Decoração', 'Som', 'Iluminação'] }
      }
    },
    data: {
      type: 'SPACE'
    }
  });
  console.log("Updated SPACES");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
