import { NextApiRequest, NextApiResponse } from "next";
// este stream é do próprio Node
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

// função que converte essa readable stream em um objeto/ uma requisição em si
async function buffer(readable: Readable) {
  // pedaços da stream
  const chunks = [];

  // cada vez que recebemos um valor da requisição, este valor vai sendo armazenado dentro de chunk.
  // esse for await vai aguardando novos chunks e armazenando-os
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  // ao final, todos os chunks são concatenados e convertidos em um Buffer.
  return Buffer.concat(chunks);
}

// por padrão, o Next tem um formato de entender a requisição. Toda requisição vem como um json, por exemplo. Porém, neste caso, a requisição estará vindo como stream, tornando-se necessário desabilitar o entendimento padrão do Next sobre o que vem da requisição
export const config = {
  api: {
    bodyParser: false,
  },
};

// define quais eventos são relevantes para a nossa aplicação, ou seja, quais eventos a aplicação deve ouvir.
// Set é como se fosse um array, mas que não pode ter nada duplicado.
const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //  a rota só será chamada se o método for POST
  if (req.method === "POST") {
    //  a requisição é lida utilizando o Readable
    const buf = await buffer(req);

    // 'stripe-signature' é o campo código de 'autenticação' enviado pelo stripe, comprovando que é ele que está fazendo a requisição e não um app mal intensionado.
    const secret = req.headers["stripe-signature"];

    // Stripe.Event são os eventos que vêm do webhook
    let event: Stripe.Event;

    try {
      // a função constructEvent recebe o buffer, o segredo que está sendo recebido, e o segredo que temos salvo nas nossas variáveis de ambiente e que será comparado para verificação de autenticidade
      event = stripe.webhooks.constructEvent(
        buf,
        secret,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    // tipo de evento retornado do Stripe (ex.:cartão recusado, compra aprovada...)
    const { type } = event;

    if (relevantEvents.has(type)) {
      try {
        switch (type) {
          case "customer.subscription.updated":
          case "customer.subscription.deleted":
            const subscription = event.data.object as Stripe.Subscription;

            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false
            );

            break;
          case "checkout.session.completed":
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session;

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            );

            break;
          default:
            throw new Error("Unhandled event.");
        }
      } catch (err) {
        // não adiciona status pq se trata de um erro de desenvolvimento, desta forma, se fosse adicionado um status, o stripe continuaria tentando fazer a requisição.
        return res.json({ error: "Webhook handler failed" });
      }
    }

    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};
