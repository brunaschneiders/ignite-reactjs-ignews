import { loadStripe } from "@stripe/stripe-js";

export async function getStripeJs() {
  // passar a chave pública do stripe -  Desenvolvedores - chaves da API - Chave publicável
  const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

  return stripeJs;
}
