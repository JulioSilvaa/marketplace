import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error("Erro: STRIPE_SECRET_KEY não definida no arquivo .env");
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-12-18.acacia",
});

async function createCoupon(
  code: string,
  name: string,
  percentOff: number,
  duration: Stripe.Coupon.Duration,
  durationInMonths?: number
) {
  console.log(`Criando cupom: ${name} (${code})...`);
  try {
    const coupon = await stripe.coupons.create({
      name,
      percent_off: percentOff,
      duration,
      duration_in_months: durationInMonths,
      id: code, // Force the ID to be the specific code
    });
    console.log(`Cupom criado com sucesso! Código: ${coupon.id}`);
    return coupon;
  } catch (error: any) {
    if (error.code === "resource_already_exists") {
      console.log(`O cupom "${code}" já existe na sua conta Stripe.`);
      return { id: code };
    }
    console.error(`Erro ao criar cupom ${name}:`, error);
    return null;
  }
}

async function main() {
  console.log("Criando Cupom de Desconto...");

  // EDITAR AQUI SE PRECISAR MUDAR O CÓDIGO
  const COUPON_CODE = "DESCONTO50";
  const COUPON_NAME = "Desconto de 50% (Especial)";
  const PERCENT_OFF = 50; // 50%
  const DURATION = "once"; // 'once', 'repeating', 'forever'

  await createCoupon(COUPON_CODE, COUPON_NAME, PERCENT_OFF, DURATION);

  console.log("\n--------------------------------------------------");
  console.log(
    "Se precisar de outros cupons, edite este script (scripts/create_prod_coupon.ts) e rode novamente."
  );
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
