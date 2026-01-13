import { prisma } from "../lib/prisma";

async function main() {
  try {
    const user = await prisma.users.findFirst();

    if (!user) {
      console.error("❌ No users found.");
      process.exit(1);
    }

    console.log(`👤 Fixing images for user: ${user.name}`);

    // Update all spaces for this user to have at least one image
    // Using a reliable placeholder image service
    const defaultImage =
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    const result = await prisma.spaces.updateMany({
      where: {
        owner_id: user.id,
      },
      data: {
        images: [defaultImage],
      },
    });

    console.log(`✅ Updated ${result.count} spaces to include default images.`);
  } catch (error) {
    console.error("❌ Error fixing images:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
