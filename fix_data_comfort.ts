import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("Fixing data: Adding default comfort items to spaces...");

  const spaces = await prisma.spaces.findMany();
  let count = 0;

  for (const s of spaces) {
    // Check if comfort is empty OR if it has empty strings OR just force it for consistency
    if (!s.comfort || s.comfort.length === 0) {
      console.log(`Updating comfort for space ${s.id}...`);
      await prisma.spaces.update({
        where: { id: s.id },
        data: { comfort: ["Wi-Fi", "Estacionamento", "Ar Condicionado", "Churrasqueira"] },
      });
      count++;
    }
  }

  console.log(`Fixed ${count} spaces.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
