import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("Fixing data: Adding default images to spaces...");

  const spaces = await prisma.spaces.findMany();
  let count = 0;

  for (const s of spaces) {
    if (!s.images || s.images.length === 0) {
      await prisma.spaces.update({
        where: { id: s.id },
        data: {
          images: [
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2698&ixlib=rb-4.0.3",
          ],
        },
      });
      count++;
    }
  }

  console.log(`Fixed images for ${count} spaces.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
