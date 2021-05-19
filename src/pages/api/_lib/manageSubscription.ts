import { query as q } from "faunadb";
import { fauna } from "../../../services/fauna";
import { stripe } from "../../../services/stripe";

// essa função salva essas informações no banco de dados
export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  // se é uma ação de criação ou não (pode ser update ou delete)
  createAction = false
) {
  // buscar o usuário no banco do FaunaDB com o ID customerID(id do usuário no STRIPE)
  const userRef = await fauna.query(
    //   q.Select determina qual campo será retornado do banco, para evitar uso desnecessário de dados. Neste caso, só preciso do ref do usuário.
    q.Select(
      "ref",
      q.Get(q.Match(q.Index("user_by_stripe_customer_id"), customerId))
    )
  );

  // No evento, o stripe retorna apenas o id da subscription. Para buscar o resto das informações, executamos o código abaixo:
  // .retrieve pq quero buscar uma só
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  };

  // salvar os dados da subscription do usuário no FaunaDB
  if (createAction) {
    await fauna.query(
      q.Create(q.Collection("subscriptions"), { data: subscriptionData })
    );
  } else {
    //   com update consigo atualizar alguns campos dentro do registro. Já o replace substitui toda a subscription.
    await fauna.query(
      q.Replace(
        q.Select(
          "ref",
          q.Get(q.Match(q.Index("subscription_by_id"), subscriptionId))
        ),
        // dados que substituirão o existente
        { data: subscriptionData }
      )
    );
  }
}
