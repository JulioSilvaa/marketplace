import dotenv from "dotenv";
import path from "path";
import Stripe from "stripe";
import { fileURLToPath } from "url";

// Carregar variáveis de ambiente do .env na raiz do projeto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia" as any,
});

async function main() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    console.error("❌ ERRO: STRIPE_SECRET_KEY não encontrada no arquivo .env");
    process.exit(1);
  }

  console.log("🚀 Iniciando configuração de produtos no Stripe...\n");

  try {
    // 1. Criar Plano Fundador
    console.log("📦 Criando Produto: Plano Fundador...");
    const founderProduct = await stripe.products.create({
      name: "Plano Fundador",
      description: "Plano promocional para os primeiros 20 anunciantes.",
      metadata: { plan_type: "founder" },
    });

    const founderPrice = await stripe.prices.create({
      product: founderProduct.id,
      unit_amount: 2500, // R$ 25.00
      currency: "brl",
      recurring: { interval: "month" },
      nickname: "Assinatura Mensal Fundador",
    });

    console.log("✅ Plano Fundador criado com sucesso!");
    console.log(`   Product ID: ${founderProduct.id}`);
    console.log(`   Price ID:   ${founderPrice.id}\n`);

    // 2. Criar Plano Normal
    console.log("📦 Criando Produto: Plano Normal...");
    const normalProduct = await stripe.products.create({
      name: "Plano Normal",
      description: "Plano padrão de assinatura mensal.",
      metadata: { plan_type: "normal" },
    });

    const normalPrice = await stripe.prices.create({
      product: normalProduct.id,
      unit_amount: 5000, // R$ 50.00
      currency: "brl",
      recurring: { interval: "month" },
      nickname: "Assinatura Mensal Normal",
    });

    console.log("✅ Plano Normal criado com sucesso!");
    console.log(`   Product ID: ${normalProduct.id}`);
    console.log(`   Price ID:   ${normalPrice.id}\n`);

    console.log("🏁 Configuração finalizada!");
    console.log("---------------------------------------------------------");
    console.log("Adicione as seguintes variáveis ao seu arquivo .env:");
    console.log(`STRIPE_PRICE_ID_FOUNDER=${founderPrice.id}`);
    console.log(`STRIPE_PRICE_ID_NORMAL=${normalPrice.id}`);
    console.log("MAX_FOUNDER_SPOTS=20");
    console.log("---------------------------------------------------------");
  } catch (error: any) {
    console.error("❌ Erro ao configurar Stripe:", error.message);
    process.exit(1);
  }
}

main();
