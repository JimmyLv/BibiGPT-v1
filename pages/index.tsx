import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";

const Home: NextPage = () => {
  const [article, setArticle] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  console.log({ summary });

  const generateSummary = async () => {
    setLoading(true);
    const response = await fetch("/api/serverless-summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: article }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    let answer = await response.json();
    setSummary(answer.choices[0].text);
    setLoading(false);

    // const data = response.body;
    // if (!data) {
    //   return;
    // }

    // const reader = data.getReader();
    // const decoder = new TextDecoder();
    // let done = false;

    // while (!done) {
    //   const { value, done: doneReading } = await reader.read();
    //   done = doneReading;
    //   const chunkValue = decoder.decode(value);
    //   setSummary((prev) => prev + chunkValue);
    // }
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto pt-20 min-h-screen">
      <Head>
        <title>TechCrunch Summarizer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="flex flex-col max-w-5xl mx-auto justify-center content-center mt-20 flex-1">
        <h1 className="max-w-5xl text-3xl sm:text-7xl font-bold text-center">
          Summarize any <span className="text-green-500">TechCrunch</span>{" "}
          article in seconds
        </h1>
        <p className="text-xl sm:text-2xl mt-10 text-center">
          Copy and paste any <span className="text-green-500">TechCrunch </span>
          article link below.
        </p>
        <input
          type="text"
          value={article}
          onChange={(e) => setArticle(e.target.value)}
          className="bg-black border mx-auto sm:mt-10 mt-7 p-3 border-gray-500 rounded-lg w-3/4 outline-white outline-1"
          placeholder="https://techcrunch.com/2023/01/31/google-fi-customer-data-breach"
        />
        {!loading && (
          <button
            className="bg-green-500 mx-auto w-1/3 sm:mt-10 mt-7 p-3 border-gray-500 rounded-2xl z-10 font-medium text-lg hover:bg-green-400 transition"
            onClick={generateSummary}
          >
            Summarize
          </button>
        )}
        {loading && (
          <button
            className="bg-green-500 mx-auto w-1/3 sm:mt-10 mt-7 p-3 border-gray-500 rounded-2xl z-10 font-medium text-lg hover:bg-green-400 transition"
            onClick={generateSummary}
            disabled
          >
            ...
          </button>
        )}
        {summary && (
          <div className="mb-10">
            <h2 className="text-3xl sm:text-5xl mt-12 text-center font-bold">
              Summary
            </h2>
            <p className="mt-6 max-w-3xl mx-auto text-lg leading-7">
              {summary.split(".").map((sentence, index) => (
                <div>
                  {sentence.length > 0 && (
                    <li key={index} className="list-disc mb-2">
                      {sentence}
                    </li>
                  )}
                </div>
              ))}
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
