import type { NextPage } from "next";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useLocalStorage } from "react-use";
import { useToast } from "~/hooks/use-toast";
import Sentence from "../components/Sentence";
import SquigglyLines from "../components/SquigglyLines";
import { useSummarize } from "~/hooks/useSummarize";
import { CHECKOUT_URL } from "~/utils/constants";
import { extractTimestamp } from "~/utils/extractTimestamp";
import { TypeAnimation } from "react-type-animation";

let isSecureContext = false;

if (typeof window !== "undefined") {
  isSecureContext = window.isSecureContext;
}

export const Home: NextPage = () => {
  const router = useRouter();
  const urlState = router.query.slug;
  const searchParams = useSearchParams();
  const licenseKey = searchParams.get("license_key");
  const [curVideo, setCurVideo] = useState<string>("");
  const [currentBvId, setCurrentBvId] = useState<string>("");
  const [userKey, setUserKey] = useLocalStorage<string>("user-openai-apikey");
  const { loading, summary, resetSummary, summarize } = useSummarize();
  const { toast } = useToast();

  useEffect(() => {
    licenseKey && setUserKey(licenseKey);
  }, [licenseKey]);

  useEffect(() => {
    const isValidatedUrl =
      urlState &&
      router.isReady &&
      !curVideo &&
      typeof urlState !== "string" &&
      urlState.every((subslug: string) => typeof subslug === "string");

    if (isValidatedUrl) {
      generateSummary(
        `https://bilibili.com/${(urlState as string[]).join("/")}`
      );
    }
    // TODO: find reason to trigger twice
  }, [router.isReady, urlState]);

  const validateUrl = (url?: string) => {
    if (url) {
      if (!url.includes("bilibili.com")) {
        toast({
          // variant: "destructive",
          title: "暂不支持此视频链接",
          description: "请输入哔哩哔哩视频长链接，暂不支持b23.tv或av号",
        });
        return;
      }
      setCurVideo(url);
    } else {
      if (!curVideo.includes("bilibili.com")) {
        toast({
          // variant: "destructive",
          title: "暂不支持此视频链接",
          description: "请输入哔哩哔哩视频长链接，暂不支持b23.tv或av号",
        });
        return;
      }
      const curUrl = String(curVideo.split(".com")[1]);
      router.replace(curUrl);
    }
  };
  const generateSummary = async (url?: string) => {
    resetSummary();
    validateUrl(url);

    const videoUrl = url ? url : curVideo;
    const matchResult = videoUrl.match(/\/video\/([^\/\?]+)/);
    if (!matchResult) {
      return;
    }
    const bvId = matchResult[1];
    setCurrentBvId(matchResult[1]);

    await summarize(bvId, userKey);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 10);
  };
  const onFormSubmit = async (e: any) => {
    e.preventDefault();
    await generateSummary();
  };

  const summaryArray = summary.split("- ");
  const formattedSummary = summaryArray
    .map((s) => {
      const matchResult = s.match(/\s*(\d+[\.:]\d+)(.*)/);
      if (matchResult) {
        const { formattedContent, timestamp } = extractTimestamp(matchResult);
        return timestamp + formattedContent;
      } else {
        return s.replace(/\n\n/g, "\n");
      }
    })
    .join("\n- ");

  const handleCopy = () => {
    if (!isSecureContext) {
      toast({ description: "复制错误 ❌" });
      return;
    }
    // todo: update the timestamp
    navigator.clipboard.writeText(
      formattedSummary + "\n\n via #BibiGPT b.jimmylv.cn @吕立青_JimmyLv"
    );
    toast({ description: "复制成功 ✂️" });
  };

  return (
    <div className="mt-10 sm:mt-40">
  
      <div className="max-w-5xl text-center text-4xl font-bold sm:text-7xl">
        一键总结{" "}
        <span className="relative whitespace-nowrap	text-pink-400">
          <SquigglyLines />
          <TypeAnimation
            sequence={[
              "哔哩哔哩",
              3000,
              "YouTube",
              3000,
              "播客",
              3000,
              "会议",
              3000,
              "小勺子",
              3000,
              () => {
                console.log("Done typing!"); // Place optional callbacks anywhere in the array
              },
            ]}
            wrapper="span"
            cursor={true}
            repeat={Infinity}
            className="relative text-pink-400	"
          />
        </span>{" "}
        音视频内容 <br />
        <div className="mt-4">Powered by GPT-3.5 AI</div>
      </div>
      <p className="mt-10 text-center text-lg text-gray-500 sm:text-2xl">
        在下面的输入框，直接复制粘贴 bilibili.com 视频链接，按下「回车」即可生成视频摘要。👇
      </p>
      <form onSubmit={onFormSubmit} className="grid place-items-center">
        <input
          type="text"
          value={curVideo}
          onChange={(e) => setCurVideo(e.target.value)}
          className="mx-auto mt-10 w-full appearance-none rounded-lg rounded-md border bg-transparent py-2 pl-2 text-sm leading-6 text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={"输入 bilibili.com 视频链接，按下「回车」"}
        />
        {!loading && (
          <button
            className="z-10 mx-auto mt-7 w-3/4 rounded-2xl border-gray-500 bg-sky-400 p-3 text-lg font-medium text-white transition hover:bg-sky-500 sm:mt-10 sm:w-1/3"
            type="submit"
          >
            一键总结
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
      </form>
      {summary && (
        <div className="mb-8 px-4">
          <h3 className="m-8 mx-auto max-w-3xl border-t-2 border-dashed pt-8 text-center text-2xl font-bold sm:text-4xl">
            <a
              href={curVideo}
              className="hover:text-pink-600 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {`【📝 总结：${currentBvId}】`}
            </a>
          </h3>
          <div
            className="mx-auto mt-6 max-w-3xl cursor-copy rounded-xl border-2 bg-white p-4 text-lg leading-7 shadow-md transition hover:bg-gray-50"
            onClick={handleCopy}
          >
            {summaryArray.map((sentence, index) => (
              <div key={index}>
                {sentence.length > 0 && (
                  <Sentence bvId={currentBvId} sentence={sentence} />
                )}
              </div>
            ))}
          </div>
          <div className="mx-auto mt-7 flex max-w-3xl flex-row-reverse gap-x-4">
            <a
              className="w-32 cursor-pointer rounded-lg bg-pink-400 px-2 py-1 text-center font-medium text-white hover:bg-pink-400/80"
              href="https://space.bilibili.com/37648256"
              target="_blank"
              rel="noopener noreferrer"
            >
              （关注我 😛）
            </a>
            <a
              href={curVideo}
              className="w-24 cursor-pointer rounded-lg bg-sky-400 px-2 py-1 text-center font-medium text-white hover:bg-sky-400/80"
              target="_blank"
              rel="noreferrer"
            >
              回到视频
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
