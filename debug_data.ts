import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("Debugging spaces data...");

  const spaces = await prisma.spaces.findMany();
  console.log(`Found ${spaces.length} spaces.`);

  for (const s of spaces) {
    console.log(
      `ID: ${s.id.substring(0, 8)}... | Status: ${s.status} | Comfort: ${JSON.stringify(s.comfort)} | Images: ${s.images.length}`
    );

    if (!s.comfort || s.comfort.length === 0) {
      console.warn(`!!! Space ${s.id} has EMPTY comfort!`);
    }
    if (!s.images || s.images.length === 0) {
      console.warn(`!!! Space ${s.id} has EMPTY images!`);
    }
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
