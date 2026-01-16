import { prisma } from "../src/lib/prisma";

async function main() {
  const subs = await prisma.subscriptions.findMany({
    where: {
      status: "active",
    },
    include: {
      spaces: {
        select: {
          title: true,
          users: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  });

  console.log("All Active Subscriptions:", JSON.stringify(subs, null, 2));
}

main().finally(async () => {
  await prisma.$disconnect();
});
