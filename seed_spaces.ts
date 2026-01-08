import { PrismaClient } from './generated/prisma/client';
import { randomUUID } from 'crypto';

// Set the DATABASE_URL environment variable explicitly before instantiation
process.env.DATABASE_URL = 'postgresql://postgres:Casa241Projetoseguro@db.hxrtqkluccabdcymffut.supabase.co:5432/postgres';

const prisma = new PrismaClient();

const CITIES = ['São Carlos', 'Araraquara', 'Ibaté', 'Dourado', 'Ribeirão Bonito'];
const TITLES_PREFIX = ['Chácara', 'Sítio', 'Salão', 'Espaço', 'Rancho', 'Fazenda'];
const TITLES_SUFFIX = ['Recanto', 'Sossego', 'Alegria', 'Paz', 'Natureza', 'Sol', 'Lua', 'Estrela', 'Vida', 'Bela Vista', 'Harmonia'];
const IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
];

async function main() {
  console.log('Starting seed...');

  // Get a user
  const user = await prisma.users.findFirst();
  if (!user) {
    console.error('No user found');
    return;
  }
  console.log(`Using user: ${user.id}`);

  const spaces = [];
  for (let i = 0; i < 30; i++) {
    const prefix = TITLES_PREFIX[Math.floor(Math.random() * TITLES_PREFIX.length)];
    const suffix = TITLES_SUFFIX[Math.floor(Math.random() * TITLES_SUFFIX.length)];
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const image = IMAGES[Math.floor(Math.random() * IMAGES.length)];

    // Determine category based on prefix for slight realism
    let category_id = 1; // Default Chácara
    if (prefix.includes('Salão')) category_id = 2;
    if (prefix.includes('Espaço')) category_id = 3;

    spaces.push({
      id: randomUUID(),
      owner_id: user.id,
      category_id: category_id,
      title: `${prefix} ${suffix} ${i + 1}`,
      description: `Lindo(a) ${prefix.toLowerCase()} localizado(a) em ${city}. Perfeito para seu evento.`,
      price_per_day: Math.floor(Math.random() * 1500) + 300,
      city: city,
      state: 'SP',
      status: 'active',
      street: `Rua Aleatória ${i}`,
      number: `${Math.floor(Math.random() * 1000)}`,
      neighborhood: 'Centro',
      zipcode: '13560-000',
      country: 'Brasil',
      images: [image],
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  for (const space of spaces) {
    await prisma.spaces.create({ data: space });
  }

  console.log('Seeded 30 spaces successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
