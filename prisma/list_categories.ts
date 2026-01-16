import { prisma } from "../src/lib/prisma";

async function main() {
  const categories = await prisma.categories.findMany();
  console.log("Categories in DB:", JSON.stringify(categories, null, 2));
}

main().finally(async () => {
  await prisma.$disconnect();
});
