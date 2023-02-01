import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    let description = "Summarize TechCrunch articles in seconds.";
    let ogimage = "https://www.techcrunchsummary.com/og-image.png";
    let sitename = "techcrunchsummary.com";
    let title = "TechCrunch Summarizer";

    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta name="description" content={description} />
          <meta property="og:site_name" content={sitename} />
          <meta property="og:description" content={description} />
          <meta property="og:title" content={title} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta property="og:image" content={ogimage} />
          <meta name="twitter:image" content={ogimage} />
        </Head>
        <body className="bg-black text-white">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
