import { prisma } from "../lib/prisma";

async function main() {
  try {
    const user = await prisma.users.findFirst();

    if (!user) {
      console.error("❌ No users found.");
      process.exit(1);
    }

    console.log(`👤 Updating spaces for user: ${user.name}`);

    const result = await prisma.spaces.updateMany({
      where: {
        owner_id: user.id,
      },
      data: {
        status: "active",
      },
    });

    console.log(`✅ Updated ${result.count} spaces to 'active' status.`);
  } catch (error) {
    console.error("❌ Error updating spaces:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
