import crypto from "crypto";

import { prisma } from "../lib/prisma";

async function main() {
  try {
    const user = await prisma.users.findFirst();

    if (!user) {
      console.error("❌ No users found to assign spaces to.");
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.name} (${user.id})`);
    console.log("🚀 Creating 30 spaces...");

    const spacesData = Array.from({ length: 30 }).map((_, i) => ({
      id: crypto.randomUUID(),
      owner_id: user.id,
      title: `Space ${i + 1} - populated`,
      description: `Description for populated space ${i + 1}`,
      street: "Rua Teste",
      number: `${i + 100}`,
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipcode: "01000-000",
      country: "Brasil",
      status: "inactive", // inactive to test activation flow if needed
      price_per_day: 100 + i,
      category_id: null, // Assuming optional or we might fail if not nullable. Schema said category_id Int? so it is nullable.
    }));

    // Create many is more efficient
    await prisma.spaces.createMany({
      data: spacesData,
    });

    console.log("✅ 30 spaces created successfully!");
  } catch (error) {
    console.error("❌ Error populating spaces:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
