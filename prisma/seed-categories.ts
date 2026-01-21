import { PrismaClient, ListingType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding categories...");

  const categories = [
    // Spaces (Existing ones - ensure type is SPACE)
    { name: "Chácara", type: ListingType.SPACE },
    { name: "Sítio", type: ListingType.SPACE },
    { name: "Salão de Festas", type: ListingType.SPACE },
    { name: "Área de Lazer", type: ListingType.SPACE },
    { name: "Rancho", type: ListingType.SPACE },

    // Services
    { name: "DJ", type: ListingType.SERVICE },
    { name: "Buffet", type: ListingType.SERVICE },
    { name: "Segurança", type: ListingType.SERVICE },
    { name: "Som e Iluminação", type: ListingType.SERVICE },

    // Equipment
    { name: "Mesas e Cadeiras", type: ListingType.EQUIPMENT },
    { name: "Brinquedos e Infláveis", type: ListingType.EQUIPMENT },
    { name: "Tendas e Coberturas", type: ListingType.EQUIPMENT },
    { name: "Geradores", type: ListingType.EQUIPMENT },
    { name: "Palco e Estrutura", type: ListingType.EQUIPMENT },
    { name: "Telões e Projetores", type: ListingType.EQUIPMENT },
  ];

  for (const cat of categories) {
    const existing = await prisma.categories.findUnique({
      where: { name: cat.name },
    });

    if (existing) {
      console.log(`Updating category: ${cat.name}`);
      await prisma.categories.update({
        where: { name: cat.name },
        data: { type: cat.type },
      });
    } else {
      console.log(`Creating category: ${cat.name}`);
      await prisma.categories.create({
        data: cat,
      });
    }
  }

  console.log("Seeding finished.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
