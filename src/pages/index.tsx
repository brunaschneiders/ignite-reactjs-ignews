import { GetStaticProps } from "next";
import Head from "next/head";
import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from "../services/stripe";

import styles from "./home.module.scss";

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  };
}

export default function Home({ product }: HomeProps) {
  //  props recebidas a partir de getServerSideProps
  return (
    <>
      {/* o head pode ser colocado em qualquer parte da aplicação */}
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get access to all the public icons <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>
        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  );
}

// DEVE TER ESSA NOMENCLATURA. Função executada na camada do Next, ou seja, todo código contido nela é executado no servidor node do next
export const getStaticProps: GetStaticProps = async () => {
  //price_1Im7VHEbwrDwibHR9cfDXLdE é o id do produto
  const price = await stripe.prices.retrieve("price_1Im7VHEbwrDwibHR9cfDXLdE", {
    //  setando o expand é retornado as informações expandidas do produto, como nome e descrição.
    expand: ["product"],
  });

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      // retorna o preco em centavos
    }).format(price.unit_amount / 100),
  };

  return {
    // essas props podem ser acessadas pela página
    props: {
      product,
    },
    revalidate: 60 * 60 * 24,
  };
};
