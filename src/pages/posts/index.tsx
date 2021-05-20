import { GetStaticProps } from "next";
import Head from "next/head";
import Prismic from "@prismicio/client";
import { RichText } from "prismic-dom";

import { getPrismicClient } from "../../services/prismic";

import styles from "./styles.module.scss";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
};

interface PostsProps {
  posts: Post[];
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <a key={post.slug} href="#">
              <time>{post.updatedAt}</time>
              <strong>{post.title}</strong>
              <p>{post.excerpt}</p>
            </a>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  // busca todos os documentos, cujo type seja post
  const response = await prismic.query(
    [Prismic.predicates.at("document.type", "post")],
    {
      //  dados do post que eu quero buscar
      fetch: ["post.title", "post.content"],
      //  quantos posts por página eu quero ter
      pageSize: 100,
    }
  );

  // formatar os dados logo que trazidos da API, melhora o processamento da aplicação, uma vez que esta não precisará ser feita em tempo de execução do código.
  const posts = response.results.map(post => {
    return {
      // url do post
      slug: post.uid,
      // transforma em texto
      title: RichText.asText(post.data.title),
      // pega o primeiro parágrafo do post que será exibido para não assinantes. Se não tiver nenhum parágrafo, retorna string vazia
      excerpt:
        post.data.content.find(content => content.type === "paragraph")?.text ??
        "",

      updatedAt: new Date(post.last_publication_date).toLocaleDateString(
        "pt-BR",
        { day: "2-digit", month: "long", year: "numeric" }
      ),
    };
  });

  // console.log(JSON.stringify(response, null, 2));
  return {
    props: { posts },
  };
};
