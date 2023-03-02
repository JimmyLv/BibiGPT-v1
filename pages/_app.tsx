import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import Head from "next/head";
import Footer from "../components/Footer";
import Header from "../components/Header";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col pt-8 sm:pt-10">
      <Head>
        <title>哔哩哔哩 · 视频内容一键总结</title>
      </Head>
      <Header />
      <main className="mx-auto flex max-w-5xl flex-1 flex-col justify-center px-2">
        <Component {...pageProps} />
        <Analytics />
      </main>
      <Footer />
    </div>
  );
}

export default MyApp;
