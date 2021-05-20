import Prismic from "@prismicio/client";

// criamos umas função para criar o cliente do PRISMIC porque a documentação dele recomenda que, para cada vez que for consumir os dadoos, o cliente do PRISMIC seja novamente instanciado e não reutilizado.
export function getPrismicClient(req?: unknown) {
  const prismic = Prismic.client(
    // endereço da minha aplicação no PRISMIC
    process.env.PRISMIC_ENDPOINT,
    {
      req,
      accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    }
  );

  return prismic;
}
