import { prisma } from "../src/lib/prisma";

async function main() {
  const categories = [
    { name: "Salão de Festas" },
    { name: "Chácara" },
    { name: "Área de Lazer" },
    { name: "Buffet" },
    { name: "Decoração" },
    { name: "Fotografia" },
    { name: "Som e Iluminação" },
  ];

  console.log("Seeding categories...");

  for (const cat of categories) {
    try {
      await prisma.categories.upsert({
        where: { name: cat.name },
        update: {},
        create: { name: cat.name },
      });
      console.log(`- ${cat.name} OK`);
    } catch (e) {
      console.error(`Error on ${cat.name}:`, e);
    }
  }
  console.log("Categories seeded!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
