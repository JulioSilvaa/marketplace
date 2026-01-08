import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("Fixing data: Adding default contact info to spaces...");

  const spaces = await prisma.spaces.findMany();
  let count = 0;

  for (const s of spaces) {
    if (!s.contact_phone) {
      await prisma.spaces.update({
        where: { id: s.id },
        data: {
          contact_phone: "(11) 99999-8888",
          contact_whatsapp: "(11) 97777-6666",
        },
      });
      count++;
    }
  }

  console.log(`Fixed contact info for ${count} spaces.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
