import { prisma } from "./src/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

// const prisma = new PrismaClient(); // Removed

async function main() {
  console.log("Seeding fake data...");
  const passwordHash = await bcrypt.hash("123456", 6);

  const cities = [
    "São Paulo",
    "Rio de Janeiro",
    "Curitiba",
    "Salvador",
    "Belo Horizonte",
    "Florianópolis",
    "Recife",
  ];
  const states = ["SP", "RJ", "PR", "BA", "MG", "SC", "PE"];

  const categories = ["Casamento", "Aniversário", "Corporativo", "Festa Infantil"];

  for (let i = 0; i < 10; i++) {
    const num = Math.floor(Math.random() * 100000);
    const name = `Usuario Teste ${num}`;
    const email = `user${num}@fake.com`;
    const cityIdx = Math.floor(Math.random() * cities.length);
    const createdAtDates = new Date(
      Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)
    );

    // Create User
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        password: passwordHash,
        phone: "11999999999",
        created_at: createdAtDates,
        status: "active",
      },
    });

    // Create Ad
    const adStatus = Math.random() > 0.3 ? "active" : "inactive";
    const views = Math.floor(Math.random() * 1000);

    await prisma.spaces.create({
      data: {
        id: crypto.randomUUID(),
        owner_id: user.id,
        title: `Espaço Premium ${num}`,
        description: "Espaço fantástico para seu evento. Com piscina e churrasqueira.",
        price_per_day: Math.floor(Math.random() * 2000) + 200,
        city: cities[cityIdx],
        state: states[cityIdx],
        neighborhood: "Centro",
        street: "Avenida Principal",
        number: `${num}`,
        zipcode: "01000-000",
        country: "Brasil",
        status: adStatus,
        views: views,
        images: [],
        created_at: new Date(Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)), // Ad created after user? logic slightly off but acceptable for fake
      },
    });
    console.log(`+ User: ${name} | Ad: Espaço Premium ${num} (${views} views)`);
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
