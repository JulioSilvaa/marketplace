import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "juliocesar.amancio@yahoo.com.br";
  const password = "*Casa241*Admin";

  const existingAdmin = await prisma.admin_users.findUnique({
    where: { email },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(password, 8);

    await prisma.admin_users.create({
      data: {
        email,
        password_hash: passwordHash,
        role: "super_admin",
      },
    });

    console.log(`Admin user created: ${email}`);
  } else {
    console.log(`Admin user already exists: ${email}`);
  }

  // Seed Categories
  const categories = [
    { name: "Salão de Festas" },
    { name: "Chácara" },
    { name: "Área de Lazer" },
    { name: "Buffet" },
    { name: "Decoração" },
    { name: "Fotografia" },
    { name: "Som e Iluminação" },
  ];

  for (const cat of categories) {
    await prisma.categories.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });
  }
  console.log("Categories seeded!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
