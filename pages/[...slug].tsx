import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useLocalStorage } from "react-use";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SquigglyLines from "../components/SquigglyLines";

let isSecureContext = false

if (typeof window !== 'undefined') {
  isSecureContext = window.isSecureContext
}

export const Home: NextPage = () => {
  const router = useRouter();
  const urlState = router.query.slug;
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [curVideo, setCurVideo] = useState<string>("");
  const [apiKey, setAPIKey] = useLocalStorage<string>("user-openai-apikey");

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
        toast.error("请输入哔哩哔哩视频长链接，暂不支持b23.tv或av号");
        return;
      }
      setCurVideo(url);
    } else {
      if (!curVideo.includes("bilibili.com")) {
        toast.error("请输入哔哩哔哩视频长链接，暂不支持b23.tv或av号");
        return;
      }
      router.replace(curUrl);
    }

    const videoUrl = url ? url : curVideo;
    const matchResult = videoUrl.match(/\/video\/([^\/\?]+)/);
    let bvId: string | undefined;
    if (matchResult) {
      bvId = matchResult[1];
    } else {
      return toast.error("暂不支持此视频链接");
    }

    setLoading(true);
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bvId, apiKey }),
    });

    if (!response.ok) {
      console.log("error", response);
      if (response.status === 501) {
        toast.error("啊叻？视频字幕不见了？！");
      } else {
        toast.error(response.statusText);
      }
      setLoading(false);
      return;
    }

    // await readStream(response, setSummary);
    const result = await response.json();
    if (result.errorMessage) {
      setLoading(false);
      toast.error(result.errorMessage);
      return;
    }
    setSummary(result);
    setLoading(false);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 10);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col pt-8 sm:pt-10">
      <Head>
        <title>哔哩哔哩 · 视频内容一键总结</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="mx-auto mt-10 flex max-w-5xl flex-1 flex-col justify-center px-2 sm:mt-40">
        <a
          target="_blank"
          rel="noreferrer"
          className="mx-auto mb-5 hidden max-w-fit rounded-full border border-gray-800 px-4 py-1 text-gray-500 transition duration-300 ease-in-out hover:scale-105 hover:border-gray-700 md:block"
          href="https://www.bilibili.com/video/BV1fX4y1Q7Ux/"
        >
          你只需要把任意 Bilibili 视频 URL 中的后缀 "
          <span className="text-pink-400">.com</span>" 改成我的域名 "
          <span className="text-sky-400">jimmylv.cn</span>" 就行啦！
          <br />
          比如 www.bilibili.
          <span className="text-pink-400 line-through">com</span>
          /video/BV1k84y1e7fW 👉 www.bilibili.
          <span className="text-sky-400 underline">jimmylv.cn</span>
          /video/BV1k84y1e7fW
        </a>
        <h1 className="max-w-5xl text-center text-4xl font-bold sm:text-7xl">
          一键总结{" "}
          <span className="relative whitespace-nowrap text-[#3290EE]">
            <SquigglyLines />
            <span className="relative text-pink-400	">哔哩哔哩</span>
          </span>{" "}
          视频内容 <br />
          <div className="mt-4">Powered by GPT-3 AI</div>
        </h1>
        <p className="mt-10 text-center text-lg text-gray-500 sm:text-2xl">
          在下面的输入框，直接复制粘贴{" "}
          <span className="text-pink-400	">哔哩哔哩 </span>
          视频链接 👇
        </p>
        <details>
          <summary className="mt-10 flex cursor-pointer items-center space-x-3	">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-left font-medium">
              <span className="text-sky-400 hover:text-sky-600">
                请使用自己的 API Key
              </span>{" "}
              <a href="/wechat.jpg" target="_blank" rel="noopener noreferrer">
                （我的账号没钱了，也可以就真的「给我打钱」哦 🤣）
              </a>
            </p>
          </summary>
          <div className="text-lg text-slate-700 dark:text-slate-400">
            <input
              value={apiKey}
              onChange={(e) => setAPIKey(e.target.value)}
              className="mx-auto my-4 w-full appearance-none rounded-lg rounded-md border bg-transparent py-2 pl-2 text-sm leading-6 text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={"填你的 OpenAI API Key: sk-xxxxx"}
            />
            <p className="relin-paragraph-target mt-1 text-base text-slate-500">
              如何获取你自己的 OpenAI API{" "}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 mb-6 font-semibold text-sky-500 dark:text-sky-400"
              >
                https://platform.openai.com/account/api-keys
              </a>
            </p>
          </div>
        </details>
        <input
          type="text"
          value={curVideo}
          onChange={(e) => setCurVideo(e.target.value)}
          className="mx-auto mt-10 w-full appearance-none rounded-lg rounded-md border bg-transparent py-2 pl-2 text-sm leading-6 text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={"输入我的 bilibili.com 视频链接"}
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
          toastOptions={{ duration: 4000 }}
        />
        {summary && (
          <div className="mb-8 px-4">
            <h3 className="m-8 mx-auto max-w-3xl border-t border-gray-600 pt-8 text-center text-2xl font-bold sm:text-4xl">
              <a
                href={curVideo}
                className="hover:text-pink-600"
                target="_blank"
                rel="noreferrer"
              >
                【📝 总结】
              </a>
            </h3>
            <div
              className="mx-auto mt-6 max-w-3xl cursor-copy rounded-xl border bg-white p-4 text-lg leading-7 shadow-md transition hover:bg-gray-50"
              onClick={() => {
                if (!isSecureContext) {
                  toast("复制错误", {
                    icon: "❌",
                  });
                  return;
                }
                navigator.clipboard.writeText(summary);
                toast("复制成功", {
                  icon: "✂️",
                });
              }}
            >
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
