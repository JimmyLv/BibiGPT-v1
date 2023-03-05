import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import {
  createBrowserSupabaseClient,
  Session,
} from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import "../styles/globals.css";
import Head from "next/head";
import React, { useState } from "react";
import CommandMenu from "~/components/CommandMenu";
import Footer from "../components/Footer";
import Header from "../components/Header";

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session;
}>) {
  // Create a new supabase browser client on every first render.
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col pt-8 sm:pt-10">
        <Head>
          <title>哔哩哔哩 · 视频内容一键总结</title>
        </Head>
        <Header />
        <main className="mx-auto flex max-w-5xl flex-1 flex-col justify-center px-2">
          <Component {...pageProps} />
          <Analytics />
          <CommandMenu />
        </main>
        <Footer />
      </div>
    </SessionContextProvider>
  );
}

export default MyApp;
