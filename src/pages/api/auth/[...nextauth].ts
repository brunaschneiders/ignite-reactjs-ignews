import { query as q } from "faunadb";

import NextAuth from "next-auth";
import Providers from "next-auth/providers";

import { fauna } from "../../../services/fauna";

// o next-auth salva as informações do usuário logado dentro dos cookies da aplicação e estes podem ser acessados pelas demais rotas da API e pelo front-end
export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      // consiste nas informações do usuário que eu quero ter acesso
      scope: "read:user",
    }),
  ],

  callbacks: {
    async signIn(user, account, profile) {
      const { email } = user;

      try {
        await fauna.query(
          // se nao existe um usuário ao qual da match entre o dado do banco q.Index("user_by_email") e o dado que será salvo q.Casefold(user.email), ele cria o dado no Banco. Senão, eu apenas busco as suas informações. Poderia fazer um update no lugar de get para atualizar os dados no banco, caso ele ja exista.
          q.If(
            q.Not(
              q.Exists(
                // casefold elimina diferença entre minuscula e maiuscula
                q.Match(q.Index("user_by_email"), q.Casefold(user.email))
              )
            ),
            q.Create(q.Collection("users"), { data: { email } }),
            q.Get(q.Match(q.Index("user_by_email"), q.Casefold(user.email)))
          )
        );

        return true;
      } catch (error) {
        return false;
      }
    },
  },
});
