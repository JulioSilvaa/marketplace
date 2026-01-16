import { prisma } from "../src/lib/prisma";

async function main() {
  const ad = await prisma.spaces.findFirst({
    where: { title: "sitio final de semana" },
    include: { category: true },
  });
  console.log("Ad Data ID:", ad?.id);
  console.log("Ad Category ID:", ad?.category_id);
  console.log("Ad Category Relation:", ad?.category);
}

main().finally(async () => {
  await prisma.$disconnect();
});
