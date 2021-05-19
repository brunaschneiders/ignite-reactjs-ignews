import { fauna } from "./../../services/fauna";
import { query as q } from "faunadb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { stripe } from "../../services/stripe";

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //    a criação de um checkout session do STRIPE é feita através de uma requisição POST
  if (req.method === "POST") {
    // quando iniciar esse processo, será criado um customer dentro do painel do STRIPE. O mesmo usuário que está logado na aplicação
    // o next-auth salva as informações do usuário logado dentro dos cookies da aplicação e estes podem ser acessados pelas demais rotas da API e pelo front-end

    // esse get acessa os cookies que contêm os dados do usuario logado.
    const session = await getSession({ req });

    const user = await fauna.query<User>(
      q.Get(q.Match(q.Index("user_by_email"), q.Casefold(session.user.email)))
    );

    let customerId = user.data.stripe_customer_id;

    // cria um usuário dentro do STRIPE, apenas se o usuário criado no Fauna ainda não tiver um id do stripe cadastrado.
    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
      });

      // para que não ocorra a criação de customers duplicados no STRIPE, salvaremos o id do stripe no FAUNA quando o primeiro customer for criado no STRIPE. Assim, quando o usuário fizer o subscribe ocorrerá uma verificação da existência desse ID. Caso ele já exista, esse id será utilizado e não será criado um novo customer no STRIPE.
      await fauna.query(
        q.Update(
          // Ref é a referência para o usuário (id)
          q.Ref(q.Collection("users"), user.ref.id),
          {
            data: {
              stripe_customer_id: stripeCustomer.id,
            },
          }
        )
      );

      customerId = stripeCustomer.id;
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      // quem está comprando, id do usuario criado no STRIPE
      customer: customerId,
      payment_method_types: ["card"],
      // define se eu quero obrigar o usuário a preencher o endereço ou se eu quero deixar que o Stripe lide com isso
      billing_address_collection: "required",
      // itens que a pessoa vai ter dentro do carrinho
      line_items: [
        // id do preço do produto
        { price: "price_1Im7VHEbwrDwibHR9cfDXLdE", quantity: 1 },
      ],
      // modo - pagamento recorrente
      mode: "subscription",
      // permite a inserção de códigos promocionais eventualmente
      allow_promotion_codes: true,
      // quando der sucesso, pra onde o usuário deve ser redirecionado
      success_url: process.env.STRIPE_SUCCESS_URL,
      // pra onde deve ser redirecionado caso o usuário cancele a compra.
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return res.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    // se não for uma requisição com método HTTP post, encaminho essa resposta pra quem está requisitando(front) dizendo que o método que essa rota aceita é POST
    res.setHeader("Allow", "POST");
    // entao retorno o erro 405 (não permitido)
    res.status(405).end("Method not allowed");
  }
};
