import { prisma } from "../src/lib/prisma";

async function main() {
  const categories = await prisma.categories.findMany();

  for (const cat of categories) {
    const trimmedName = cat.name.trim();
    if (cat.name !== trimmedName) {
      console.log(`Updating "${JSON.stringify(cat.name)}" to "${trimmedName}"`);
      await prisma.categories.update({
        where: { id: cat.id },
        data: { name: trimmedName },
      });
    }
  }
  console.log("Categories cleaned!");
}

main().finally(async () => {
  await prisma.$disconnect();
});
