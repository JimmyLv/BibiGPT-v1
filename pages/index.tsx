import { Poppins } from "@next/font/google";
import clsx from "clsx";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Github from "../components/GitHub";

const poppins = Poppins({ weight: "800", subsets: ["latin"] });

const Home: NextPage = () => {
  return (
    <div className="flex flex-col max-w-5xl mx-auto pt-20 min-h-screen">
      <Head>
        <title>News summarizer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex justify-between">
        <Link className="flex items-center space-x-3" href="/">
          <Image src="/write.png" alt="logo" width={40} height={40} />
          <h2 className={clsx("text-2xl", poppins.className)}>
            News summarizer.
          </h2>
        </Link>
        <a
          href="https://github.com/Nutlope?tab=repositories"
          rel="noreferrer noopener"
          target="_blank"
        >
          <Github />
        </a>
      </div>
      <main className="flex flex-col max-w-5xl mx-auto justify-center content-center mt-20 flex-1">
        <h1 className="max-w-5xl text-3xl sm:text-7xl font-bold text-center">
          Summarize any <span className="text-orange-500">TechCrunch</span>{" "}
          article in seconds
        </h1>
        <div className="flex justify-between mt-10 sm:flex-row flex-col">
          <img
            src="clear-typewriter.png"
            alt="writer"
            className="w-[500px] relative"
          />
          <div className="flex-1">
            <p className="text-xl sm:text-2xl mt-10">
              Simply <span className="text-orange-500">copy and paste</span> the
              article link below.
            </p>
            <input
              type="text"
              className="bg-black border mx-auto w-full sm:mt-10 mt-7 p-3 border-gray-500 rounded-lg"
              placeholder="https://techcrunch.com/2023/01/23/spotify-cuts-6-of-its-workforce-impacting-600-people/"
            />
            <button className="bg-orange-500 mx-auto w-full sm:mt-10 mt-7 p-3 border-gray-500 rounded-2xl z-10 font-bold text-lg hover:bg-orange-400 transition">
              Summarize
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Or try one of our links below (put 3 cards here)

export default Home;
