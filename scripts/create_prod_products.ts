import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error("Erro: STRIPE_SECRET_KEY não definida no arquivo .env");
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-12-18.acacia", // Using latest stable or matching package version
});

async function createProductAndPrice(
  name: string,
  description: string,
  amountInCents: number,
  interval: Stripe.PriceCreateParams.Recurring.Interval,
  intervalCount: number = 1
) {
  console.log(`Criando produto: ${name}...`);

  try {
    const product = await stripe.products.create({
      name,
      description,
    });

    console.log(`Produto criado! ID: ${product.id}`);

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amountInCents,
      currency: "brl",
      recurring: {
        interval: interval,
        interval_count: intervalCount,
      },
    });

    console.log(`Preço criado! ID: ${price.id} (${amountInCents / 100} BRL / ${interval})`);
    return { product, price };
  } catch (error) {
    console.error(`Erro ao criar ${name}:`, error);
    return null;
  }
}

async function main() {
  console.log("Iniciando criação dos produtos no Stripe (Verifique se a chave é de PRODUÇÃO)...");

  // 1. Plano Mensal (Normal) - R$ 50,00 / mês
  const monthly = await createProductAndPrice(
    "Plano Mensal",
    "Acesso completo ao Marketplace (Faturamento Mensal)",
    5000, // 5000 centavos = R$ 50,00
    "month"
  );

  // 2. Plano Anual (Normal) - R$ 500,00 / ano
  const annual = await createProductAndPrice(
    "Plano Anual",
    "Acesso completo ao Marketplace (Faturamento Anual)",
    50000, // 50000 centavos = R$ 500,00
    "year"
  );

  // 3. Plano Founder (Legacy/Special) - R$ 25,00 / mês
  const founder = await createProductAndPrice(
    "Plano Founder",
    "Plano especial para fundadores",
    2500, // 2500 centavos = R$ 25,00
    "month"
  );

  console.log("\n--- COPY AND PASTE INTO YOUR .ENV (PRODUCTION) ---");
  if (monthly)
    console.log(
      `STRIPE_PRICE_ID_NORMAL=${monthly.price.id} # ID do Preço Mensal (usado como default/normal)`
    );
  if (annual) console.log(`STRIPE_PRICE_ID_ANNUAL=${annual.price.id} # ID do Preço Anual`);
  if (founder) console.log(`STRIPE_PRICE_ID_FOUNDER=${founder.price.id} # ID do Preço Founder`);
  console.log("--------------------------------------------------");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
