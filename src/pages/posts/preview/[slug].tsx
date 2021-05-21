import { GetStaticPaths, GetStaticProps } from "next";
import { useSession } from "next-auth/client";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { RichText } from "prismic-dom";
import { useEffect } from "react";
import { getPrismicClient } from "../../../services/prismic";

import styles from "../post.module.scss";

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function PostPreview({ post }: PostPreviewProps) {
  //  em uma página estática, não temos nenhum acesso de sessão dentro de getStaticProps, por isso, é necessário fazer essa busca pelo próprio componente, caso necessário.
  const [session] = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log(session?.activeSubscription);
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`);
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a>Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // retorna quais caminhos (neste caso, quais previews de post) serão gerados durante a build da aplicação
  // deixando um array vazio, os posts serão carregados conforme o usuário fizer o seu primeiro acesso
  // isso só existe em páginas que tenha parametrização dinâmica ([slug].tsx). As demais o next ja gera automaticamente no build.
  return {
    // paths: [
    //   {params:{slug:""}}
    // ],
    paths: [],
    // fallback pode receber true, false ou "blocking"
    // caso seja true, quando o usuário tentar acessar um post que ainda não foi gerado de forma estática, o conteúdo do post será carregado pelo lado do browser. Problemas: carrega a página sem o conteúdo, sendo este preenchido após a requisição.
    // caso seja false, quando o usuário tentar acessar um post que ainda não foi gerado de forma estática, será retornado um 404/não encontrado. Pode ser usado quando não criamos novos registros de alguma lista.
    // caso seja "blocking", quando o usuário tentar acessar um post que ainda não foi gerado de forma estática, o conteúdo do post será carregado na camada do server e somente depois deste carregamento a página será exibida.
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID("post", String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    // pega apenas os 3 primeiros itens de content
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      "pt-BR",
      { day: "2-digit", month: "long", year: "numeric" }
    ),
  };

  return {
    props: { post },
    // o conteúdo será revalidado a cada 30 min
    revalidate: 60 * 30,
  };
};
