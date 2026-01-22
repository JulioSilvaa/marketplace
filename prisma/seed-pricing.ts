import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding pricing models...");

  const pricingModels = [
    {
      key: "daily",
      label: "Por Dia (Diária)",
      unit: "dia",
      description: "Valor cobrado por período de 24 horas. Ideal para chácaras e sítios.",
    },
    {
      key: "weekend",
      label: "Por Final de Semana",
      unit: "fim de semana",
      description: "Pacote fechado de Sexta a Domingo. Muito comum para eventos.",
    },
    {
      key: "hourly",
      label: "Por Hora",
      unit: "hora",
      description:
        "Valor cobrado por hora de uso. Ideal para quadras, estúdios ou serviços rápidos.",
    },
    {
      key: "person",
      label: "Por Pessoa",
      unit: "pessoa",
      description: "Valor por convidado. Padrão para Buffet e Churrasco.",
    },
    {
      key: "unit",
      label: "Por Unidade",
      unit: "unidade",
      description: "Valor unitário. Ideal para aluguel de mesas, cadeiras isoladas.",
    },
    {
      key: "set",
      label: "Por Jogo/Conjunto",
      unit: "jogo",
      description: "Valor por conjunto (Ex: 1 Mesa + 4 Cadeiras).",
    },
    {
      key: "event",
      label: "Por Evento (Pacote Fixo)",
      unit: "evento",
      description: "Preço único pelo serviço completo no evento (ex: DJ por 4 horas, Show).",
    },
    {
      key: "overnight",
      label: "Pernoite",
      unit: "noite",
      description: "Para hospedagem ou estadia curta.",
    },
    {
      key: "budget",
      label: "A Combinar / Consultar",
      unit: null,
      description: 'Não exibe preço fixo no anúncio. Aparecerá como "A Combinar".',
    },
  ];

  for (const model of pricingModels) {
    await prisma.pricing_models.upsert({
      where: { key: model.key },
      update: {
        label: model.label,
        unit: model.unit,
        description: model.description,
      },
      create: {
        key: model.key,
        label: model.label,
        unit: model.unit,
        description: model.description,
      },
    });
  }

  console.log("Seeding finished.");

  // Also link defaults if needed, but for now we rely on the manual linking or updated seed-categories logic
  // Update categories to link to these models based on the hardcoded logic?
  // Or do we leave that for a separate step?
  // Let's link them now to ensure the system works immediately.

  const rules = {
    space: ["daily", "weekend", "hourly", "overnight"],
    equipment: ["unit", "set", "hourly", "daily"],
    service: ["person", "hourly", "event", "budget"],
  };

  // Fetch all categories
  const categories = await prisma.categories.findMany();

  for (const cat of categories) {
    if (!cat.type) continue;

    const typeKey = cat.type.toLowerCase(); // 'space', 'service', 'equipment'
    // @ts-ignore
    const modelKeys = rules[typeKey];

    if (modelKeys) {
      // Find models
      const models = await prisma.pricing_models.findMany({
        where: { key: { in: modelKeys } },
      });

      // Link them
      await prisma.categories.update({
        where: { id: cat.id },
        data: {
          allowed_pricing_models: {
            connect: models.map(m => ({ id: m.id })),
          },
        },
      });
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
