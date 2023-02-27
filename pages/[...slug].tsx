import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SquigglyLines from "../components/SquigglyLines";

export const Home: NextPage = () => {
  const router = useRouter();
  const urlState = router.query.slug;
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [curVideo, setCurVideo] = useState<string>("");

  useEffect(() => {
    if (
      urlState &&
      router.isReady &&
      !curVideo &&
      typeof urlState !== "string" &&
      urlState.every((subslug: string) => typeof subslug === "string")
    ) {
      generateSummary(
        "https://bilibili.com/" + (urlState as string[]).join("/")
      );
    }
  }, [router.isReady, urlState]);

  const curUrl = String(curVideo.split(".com")[1]);

  const generateSummary = async (url?: string) => {
    setSummary("");
    if (url) {
      if (!url.includes("bilibili.com")) {
        toast.error("Please enter a valid 哔哩哔哩 video");
        return;
      }
      setCurVideo(url);
    } else {
      if (!curVideo.includes("bilibili.com")) {
        toast.error("Please enter a valid 哔哩哔哩 video");
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
      body: JSON.stringify({ url: url ? url : curVideo }),
    });

    if (!response.ok) {
      console.log("error", response.statusText);
      toast.error("啊叻？视频字幕不见了？！");
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
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col pt-8 sm:pt-12">
      <Head>
        <title>哔哩哔哩视频一键总结</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="mx-auto mt-10 flex max-w-5xl flex-1 flex-col justify-center px-2 sm:mt-40">
        <a
          target="_blank"
          rel="noreferrer"
          className="mx-auto mb-5 hidden max-w-fit rounded-full border border-gray-800 px-4 py-1 text-gray-500 transition duration-300 ease-in-out hover:scale-105 hover:border-gray-700 md:block"
          href="https://space.bilibili.com/37648256"
        >
          You can also go to a Bilibili video and change the suffix "
          <span className="text-pink-400">.com</span>" into "
          <span className="text-sky-400">jimmylv.cn</span>" in the URL.
          <br />
          e.g. www.bilibili.
          <span className="text-pink-400 line-through">com</span>
          /video/BV1k84y1e7fW 👉 www.bilibili.
          <span className="text-sky-400 underline">jimmylv.cn</span>
          /video/BV1k84y1e7fW
        </a>
        <h1 className="max-w-5xl text-center text-4xl font-bold sm:text-7xl">
          Summarize any{" "}
          <span className="relative whitespace-nowrap text-[#3290EE]">
            <SquigglyLines />
            <span className="relative text-pink-400	">哔哩哔哩</span>
          </span>{" "}
          video with AI
        </h1>
        <p className="mt-10 text-center text-lg text-gray-500 sm:text-2xl">
          Copy and paste any <span className="text-pink-400	">哔哩哔哩 </span>
          video link below. 👇
        </p>
        <input
          type="text"
          value={curVideo}
          onChange={(e) => setCurVideo(e.target.value)}
          className="mx-auto mt-10 w-full appearance-none rounded-lg rounded-md border bg-transparent py-2 pl-2 text-sm leading-6 text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {!loading && (
          <button
            className="z-10 mx-auto mt-7 w-3/4 rounded-2xl border-gray-500 bg-sky-400 p-3 text-lg font-medium text-white transition hover:bg-sky-500 sm:mt-10 sm:w-1/3"
            onClick={() => generateSummary()}
          >
            一键总结（三连）
          </button>
        )}
        {loading && (
          <button
            className="z-10 mx-auto mt-7 w-3/4 cursor-not-allowed rounded-2xl border-gray-500 bg-sky-400 p-3 text-lg font-medium transition hover:bg-sky-500 sm:mt-10 sm:w-1/3"
            disabled
          >
            <div className="flex items-center justify-center text-white">
              <Image
                src="/loading.svg"
                alt="Loading..."
                width={28}
                height={28}
              />
            </div>
          </button>
        )}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        {summary && (
          <div className="mb-10 px-4">
            <h2 className="mx-auto mt-16 max-w-3xl border-t border-gray-600 pt-8 text-center text-3xl font-bold sm:text-5xl">
              【📝 总结】
            </h2>
            <div className="mx-auto mt-6 max-w-3xl text-lg leading-7">
              {summary.split("- ").map((sentence, index) => (
                <div key={index}>
                  {sentence.length > 0 && (
                    <li className="mb-2 list-disc">{sentence}</li>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
