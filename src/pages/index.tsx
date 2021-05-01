import Head from "next/head";
import { SubscribeButton } from "../components/SubscribeButton";

import styles from "./home.module.scss";

export default function Home() {
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
            <span>for $9.90 month</span>
          </p>
          <SubscribeButton />
        </section>
        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  );
}
