import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Using specific Unsplash images that look like "real life" in Brazil (simple pools, brick walls)
const adsData = [
  // Page 1 (1-12)
  {
    title: "Chácara Natureza Viva Ibiúna",
    description:
      "Espetacular chácara em Ibiúna com 7.000m² de pura natureza. Casa sede ampla e avarandada. Piscina adulta e infantil, campo de futebol e lago.",
    price_per_weekend: 2500.0,
    price_per_day: 1200.0,
    category_name: "Chácara",
    images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80"],
    city: "Ibiúna",
    state: "SP",
    neighborhood: "Região de Sorocaba",
    active: true,
    featured: true,
  },
  {
    title: "Espaço de Lazer Pq. Fehr",
    description:
      "Área de lazer dentro da cidade. Piscina aquecida, churrasqueira, forno de pizza e freezer. Ótimo para aniversários.",
    price_per_weekend: 1100.0,
    price_per_day: 600.0,
    category_name: "Área de Lazer",
    images: ["https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80"],
    city: "São Carlos",
    state: "SP",
    neighborhood: "Parque Fehr",
    active: true,
  },
  {
    title: "Rancho Beira Rio",
    description:
      "Rancho para temporada e pescaria na beira do rio. Acomoda 12 pessoas em camas. Tablado de pesca incluso.",
    price_per_weekend: 800.0,
    price_per_day: 350.0,
    category_name: "Rancho",
    images: ["https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?w=800&q=80"],
    city: "São Carlos",
    state: "SP",
    neighborhood: "Ibissé",
    active: true,
  },
  {
    title: "Sítio Vista Alegre",
    description:
      "Sítio aconchegante com 3 quartos, varanda com redes, pomar e mini campo. Relaxamento total.",
    price_per_weekend: 700.0,
    price_per_day: 400.0,
    category_name: "Sítio",
    images: ["https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80"],
    city: "São Carlos",
    state: "SP",
    neighborhood: "Aracé de Santo Antônio",
    active: true,
  },
  {
    title: "Chácara Recanto do Sol",
    description:
      "Aluga-se casa no Balneário Santo Antônio (Broa). 200m da represa. Garagem para lancha.",
    price_per_weekend: 1500.0,
    price_per_day: 800.0,
    category_name: "Chácara",
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"],
    city: "Itirapina",
    state: "SP",
    neighborhood: "Balneário Santo Antônio (Broa)",
    active: true,
  },
  {
    title: "Edícula Jd. Macarengo",
    description:
      "Excelente edícula para festas rápidas. Piscina 6x3, banheiro masculino e feminino.",
    price_per_weekend: 600.0,
    price_per_day: 350.0,
    category_name: "Salão",
    images: ["https://images.unsplash.com/photo-1571781565036-d3f75df02f67?w=800&q=80"],
    city: "São Carlos",
    state: "SP",
    neighborhood: "Jardim Macarengo",
    active: true,
  },
  {
    title: "Salão Splendore",
    description: "Salão nobre no centro. Ar condicionado central e cadeiras Tiffany.",
    price_per_weekend: 4000.0,
    price_per_day: 2500.0,
    category_name: "Salão",
    images: ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80"],
    city: "São Carlos",
    state: "SP",
    neighborhood: "Centro",
    active: true,
  },
  {
    title: "Chácara dos Pinhais",
    description: "Simples e aconchegante. Muita sombra, varanda grande e piscina de fibra.",
    price_per_weekend: 750.0,
    price_per_day: 400.0,
    category_name: "Chácara",
    images: ["https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80"],
    city: "São Carlos",
    state: "SP",
    neighborhood: "Tijuco Preto",
    active: true,
  },
  {
    title: "Espaço Gourmet Varjão",
    description:
      "Área gourmet moderna com piscina aquecida solar. TV 65pol, som ambiente bluetooth.",
    price_per_weekend: 950.0,
    price_per_day: 550.0,
    category_name: "Área de Lazer",
    images: ["https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80"],
    city: "São Carlos",
    state: "SP",
    neighborhood: "Jardim Copacabana",
    active: true,
  },
  {
    title: "Sítio Santo Antônio",
    description: "Amplo espaço verde, pomar e casa rustica. Retiro espiritual.",
    price_per_weekend: 600.0,
    price_per_day: 300.0,
    category_name: "Sítio",
    images: ["https://images.unsplash.com/photo-1505576133863-60c3840eb619?w=800&q=80"],
    city: "Brotas",
    state: "SP",
    neighborhood: "Patrimônio",
    active: true,
  },
  {
    title: "Salão Moderno Jardins",
    description: "Salão clean, porcelanato, gesso e iluminação em LED.",
    price_per_weekend: 2200.0,
    price_per_day: 1500.0,
    category_name: "Salão",
    images: ["https://images.unsplash.com/photo-1519225421980-715cb0202128?w=800&q=80"],
    city: "São Paulo",
    state: "SP",
    neighborhood: "Jardins",
    active: true,
  },
  {
    title: "Chácara Pôr do Sol",
    description: "Vista incrível para o pôr do sol. Piscina com borda infinita.",
    price_per_weekend: 1800.0,
    price_per_day: 900.0,
    category_name: "Chácara",
    images: ["https://images.unsplash.com/photo-1628178652317-0b16f217f093?w=800&q=80"],
    city: "Campinas",
    state: "SP",
    neighborhood: "Souzas",
    active: true,
  },
  // Page 2 (13-24)
  {
    title: "Espaço Kids Happy",
    description: "Salão focado em festas infantis. Brinquedão e piscina de bolinhas.",
    price_per_weekend: 1200.0,
    price_per_day: 800.0,
    category_name: "Salão",
    images: ["https://images.unsplash.com/photo-1560130638-9cb525d8084a?w=800&q=80"],
    city: "São Carlos",
    state: "SP",
    neighborhood: "Vila Nery",
    active: true,
  },
  {
    title: "Rancho Pesca&Lazer",
    description: "Na beira do rio, com quiosques e área de camping.",
    price_per_weekend: 400.0,
    price_per_day: 200.0,
    category_name: "Rancho",
    images: ["https://images.unsplash.com/photo-1516216628259-22240502a801?w=800&q=80"],
    city: "Pederneiras",
    state: "SP",
    neighborhood: "Rural",
    active: true,
  },
  {
    title: "Mansão para Casamentos",
    description: "Locação exclusiva para grandes eventos e casamentos.",
    price_per_weekend: 12000.0,
    price_per_day: 5000.0,
    category_name: "Chácara",
    images: ["https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=800&q=80"],
    city: "Holambra",
    state: "SP",
    neighborhood: "Flores",
    active: true,
  },
  {
    title: "Chácara Vale Verde",
    description: "Muito verde e tranquilidade.",
    price_per_weekend: 800.0,
    price_per_day: 450.0,
    category_name: "Chácara",
    images: ["https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=800&q=80"],
    city: "Indaiatuba",
    state: "SP",
    neighborhood: "Itaici",
    active: true,
  },
  {
    title: "Salão Gold Eventos",
    description: "Capacidade para 300 pessoas.",
    price_per_weekend: 5000.0,
    price_per_day: 3000.0,
    category_name: "Salão",
    images: ["https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80"],
    city: "Ribeirão Preto",
    state: "SP",
    neighborhood: "Bonfim",
    active: true,
  },
  {
    title: "Estância Climática",
    description: "Clima de montanha e lareira.",
    price_per_weekend: 1000.0,
    price_per_day: 600.0,
    category_name: "Sítio",
    images: ["https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80"],
    city: "Cunha",
    state: "SP",
    neighborhood: "Rural",
    active: true,
  },
  {
    title: "Loft Industrial",
    description: "Locação para ensaios e pequenos eventos.",
    price_per_weekend: 900.0,
    price_per_day: 500.0,
    category_name: "Salão",
    images: ["https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=800&q=80"],
    city: "São Paulo",
    state: "SP",
    neighborhood: "Vila Madalena",
    active: true,
  },
  {
    title: "Casa de Campo Premium",
    description: "Luxo e sofisticação.",
    price_per_weekend: 2800.0,
    price_per_day: 1500.0,
    category_name: "Chácara",
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"],
    city: "Campos do Jordão",
    state: "SP",
    neighborhood: "Capivari",
    active: true,
  },
  {
    title: "Espaço Sunset",
    description: "Rooftop com vista incrível da cidade para eventos.",
    price_per_weekend: 3500.0,
    price_per_day: 2000.0,
    category_name: "Salão",
    images: ["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80"],
    city: "São Paulo",
    state: "SP",
    neighborhood: "Pinheiros",
    active: true,
  },
  {
    title: "Sítio das Águas",
    description: "Muitas nascentes e cachoeira privativa para seu lazer.",
    price_per_weekend: 650.0,
    price_per_day: 350.0,
    category_name: "Sítio",
    images: ["https://images.unsplash.com/photo-1499591934245-40b55745b905?w=800&q=80"],
    city: "Socorro",
    state: "SP",
    neighborhood: "Caminho Turístico",
    active: true,
  },
  {
    title: "Rancho Grande",
    description: "Espaço amplo para churrasco com amigos e família.",
    price_per_weekend: 750.0,
    price_per_day: 400.0,
    category_name: "Rancho",
    images: ["https://images.unsplash.com/photo-1558278280-93a0b38c2271?w=800&q=80"],
    city: "Panorama",
    state: "SP",
    neighborhood: "Rio",
    active: true,
  },
  {
    title: "Villa Toscana",
    description: "Inspiração italiana.",
    price_per_weekend: 3000.0,
    price_per_day: 1800.0,
    category_name: "Chácara",
    images: ["https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80"],
    city: "Vinhedo",
    state: "SP",
    neighborhood: "Uva",
    active: true,
  },
];

async function main() {
  console.log("Starting seed of realistic/authentic ads (v4)...");

  // Find users
  let user = await prisma.users.findUnique({
    where: { email: "fake.ads@lazer.com" },
  });

  // Create user if not exists
  if (!user) {
    user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        name: "Lazer Eventos",
        email: "fake.ads@lazer.com",
        password: "seed_only",
        phone: "16999999999",
        role: "user",
        status: "active",
      },
    });
    console.log(`Created user: ${user.email}`);
  } else {
    console.log(`User ensured: ${user.email}`);
  }

  // Delete ALL spaces from this user
  const deleted = await prisma.spaces.deleteMany({
    where: { owner_id: user.id },
  });
  console.log(`Cleaned up ${deleted.count} old spaces for user.`);

  // Categories map
  const categoriesMap: Record<string, number> = {};

  const categoryNames = [...new Set(adsData.map(a => a.category_name))];

  for (const name of categoryNames) {
    // Only use name for lookup/create since schema is strict
    let cat = await prisma.categories.findFirst({ where: { name } });
    if (!cat) {
      cat = await prisma.categories.create({
        data: {
          name,
        },
      });
    }
    categoriesMap[name] = cat.id;
  }

  // Create Ads
  for (const ad of adsData) {
    await prisma.spaces.create({
      data: {
        id: crypto.randomUUID(),
        owner_id: user.id,
        category_id: categoriesMap[ad.category_name],
        title: ad.title,
        description: ad.description,
        price_per_weekend: ad.price_per_weekend,
        price_per_day: ad.price_per_day,
        city: ad.city,
        state: ad.state,
        neighborhood: ad.neighborhood,
        street: "Seed Street",
        number: "123",
        zipcode: "00000-000",
        country: "Brasil",
        status: "active",
        specifications: {},
        comfort: ["Wifi", "Estacionamento"],
        images: ad.images, // CORRECT: string[]
      },
    });
    console.log(`Created: ${ad.title}`);
  }

  console.log("Seeding v4 completed successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
