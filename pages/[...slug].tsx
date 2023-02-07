import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";

export const Home: NextPage = () => {
  const router = useRouter();
  const urlState = router.query.slug;
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [curArticle, setCurArticle] = useState<string>("");

  console.log({ summary });

  useEffect(() => {
    if (
      urlState &&
      router.isReady &&
      typeof urlState !== "string" &&
      urlState.every((subslug: string) => typeof subslug === "string")
    ) {
      generateSummary(
        "https://techcrunch.com/" + (urlState as string[]).join("/")
      );
    }
  }, [router.isReady, urlState]);

  const curUrl = String(curArticle.split(".com")[1]);

  const generateSummary = async (url?: string) => {
    setSummary("");
    console.log({ url });
    if (url) {
      if (!url.includes("techcrunch.com")) {
        toast.error("Please enter a valid TechCrunch article");
        return;
      }
      setCurArticle(url);
    } else {
      if (!curArticle.includes("techcrunch.com")) {
        toast.error("Please enter a valid TechCrunch article");
        return;
      }
      router.replace(curUrl);
    }
    setLoading(true);
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: url ? url : curArticle }),
    });

    if (!response.ok) {
      console.log("error", response.statusText);
      return;
    }

    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setSummary((prev) => prev + chunkValue);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto sm:pt-12 pt-8 min-h-screen">
      <Head>
        <title>TechCrunch Summarizer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="flex flex-col max-w-5xl mx-auto justify-center content-center sm:mt-28 mt-10 flex-1 px-2">
        <h1 className="max-w-5xl text-4xl sm:text-7xl font-bold text-center">
          Summarize any <span className="text-green-500">TechCrunch</span>{" "}
          article in seconds
        </h1>
        <p className="text-lg sm:text-2xl mt-10 text-center">
          Copy and paste any <span className="text-green-500">TechCrunch </span>
          article below.
        </p>
        <input
          type="text"
          value={curArticle}
          onChange={(e) => setCurArticle(e.target.value)}
          className="bg-black border mx-auto sm:mt-7 mt-10 p-3 border-gray-500 rounded-lg sm:w-3/4 w-full outline-white outline-1"
          // placeholder="https://techcrunch.com/2023/01/31/google-fi-customer-data-breach"
        />
        {!loading && (
          <button
            type="submit"
            className="bg-green-500 mx-auto sm:w-1/3 w-3/4 sm:mt-10 mt-7 p-3 border-gray-500 rounded-2xl z-10 font-medium text-lg hover:bg-green-400 transition"
            onClick={() => generateSummary()}
          >
            Summarize
          </button>
        )}
        {loading && (
          <button
            className="bg-green-500 mx-auto w-1/3 sm:mt-10 mt-7 p-3 border-gray-500 rounded-2xl z-10 font-medium text-lg hover:bg-green-400 transition cursor-not-allowed"
            disabled
          >
            <LoadingDots />
          </button>
        )}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        {summary && (
          <div className="mb-10 px-4">
            <h2 className="text-3xl sm:text-5xl mt-12 text-center font-bold">
              Summary
            </h2>
            <div className="mt-6 max-w-3xl mx-auto text-lg leading-7">
              {summary.split(". ").map((sentence, index) => (
                <div key={index}>
                  {sentence.length > 0 && (
                    <li className="list-disc mb-2">{sentence}</li>
                  )}
                </div>
              ))}
              {!loading && (
                <button
                  className="bg-white text-black p-3 flex justify-center align-center mx-auto mt-10 font-semibold w-1/3 border-gray-500 rounded-2xl z-10 text-lg hover:bg-grey-200 transition"
                  onClick={() => {
                    navigator.clipboard.writeText(summary);
                    toast("Summary copied to clipboard", {
                      icon: "✂️",
                    });
                  }}
                >
                  📧 Share Summary
                </button>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
