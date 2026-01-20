import { prisma } from "../src/lib/prisma";
import { randomUUID } from "node:crypto";

async function main() {
  console.log("Seeding initial Sponsor placeholders...");

  const sponsorsData = [
    {
      name: "Anuncie Aqui - Topo",
      banner_desktop_url: "https://placehold.co/1200x300/EEE/31343C?text=Sua+Marca+Aqui+|+Hero",
      banner_mobile_url: "https://placehold.co/400x300/EEE/31343C?text=Sua+Marca+Aqui",
      link_url: "/anuncie",
      tier: "GOLD",
      display_location: "HOME_HERO",
      priority: 100,
      status: "active",
    },
    {
      name: "Anuncie Aqui - Busca",
      banner_desktop_url: "https://placehold.co/800x200/EEE/31343C?text=Sua+Marca+nos+Resultados",
      banner_mobile_url: "https://placehold.co/400x200/EEE/31343C?text=Anuncie+Aqui",
      link_url: "/anuncie",
      tier: "SILVER",
      display_location: "SEARCH_FEED",
      priority: 50,
      status: "active",
    },
    {
      name: "Anuncie Aqui - Lateral",
      banner_desktop_url: "https://placehold.co/300x300/EEE/31343C?text=Destaque+Lateral",
      banner_mobile_url: "https://placehold.co/300x150/EEE/31343C?text=Destaque",
      link_url: "/anuncie",
      tier: "BRONZE",
      display_location: "SIDEBAR",
      priority: 30,
      status: "active",
    },
  ];

  for (const sponsor of sponsorsData) {
    await prisma.sponsor.create({
      data: {
        id: randomUUID(),
        ...sponsor,
      },
    });
  }

  console.log("Sponsors seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
