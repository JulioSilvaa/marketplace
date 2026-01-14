import { prisma } from "../lib/prisma";

async function main() {
  try {
    const user = await prisma.users.findFirst();

    if (!user) {
      console.error("❌ No users found.");
      process.exit(1);
    }

    console.log(`👤 Fixing comfort items for user: ${user.name}`);

    // Update all spaces for this user to have at least one comfort item
    const result = await prisma.spaces.updateMany({
      where: {
        owner_id: user.id,
      },
      data: {
        comfort: ["Wifi", "Estacionamento"], // Adding proper default comfort items
      },
    });

    console.log(`✅ Updated ${result.count} spaces to include comfort items.`);
  } catch (error) {
    console.error("❌ Error fixing comfort items:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
