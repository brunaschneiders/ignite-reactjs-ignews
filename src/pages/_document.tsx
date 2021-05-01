import Document, { Head, Html, Main, NextScript } from "next/document";
export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* preconnect deve estar logo no começo pra que ele faça essa conexão o quanto antes, melhorando a performance. */}
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap"
            rel="stylesheet"
          />

          <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        </Head>
        <body>
          <Main />
          {/* NextScripts é onde o Next vai colocar os arquivos JS da aplicação */}
          <NextScript />
        </body>
      </Html>
    );
  }
}
