import { PrismaClient } from './generated/prisma/client/index.js';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Enabling unaccent extension...');
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS unaccent');
    console.log('Extension enabled successfully.');
  } catch (error) {
    console.error('Error enabling extension:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
