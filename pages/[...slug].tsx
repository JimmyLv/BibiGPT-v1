import type { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useLocalStorage } from "react-use";
import { useAnalytics } from "~/components/context/analytics";
import { SubmitButton } from "~/components/SubmitButton";
import { SummaryResult } from "~/components/SummaryResult";
import { SwitchTimestamp } from "~/components/SwitchTimestamp";
import { TypingSlogan } from "~/components/TypingSlogan";
import { UsageAction } from "~/components/UsageAction";
import { UsageDescription } from "~/components/UsageDescription";
import { UserKeyInput } from "~/components/UserKeyInput";
import { useToast } from "~/hooks/use-toast";
import { useSummarize } from "~/hooks/useSummarize";
import { VideoService } from "~/lib/types";
import { extractUrl } from "~/utils/extractUrl";
import { getVideoIdFromUrl } from "~/utils/getVideoIdFromUrl";
import getVideoId from "get-video-id";

export const Home: NextPage<{
  showSingIn: (show: boolean) => void;
}> = ({ showSingIn }) => {
  const router = useRouter();
  const urlState = router.query.slug;
  const searchParams = useSearchParams();
  const licenseKey = searchParams.get("license_key");

  // TODO: add mobx or state manager
  const [currentVideoId, setCurrentVideoId] = useState<string>("");
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");
  const [shouldShowTimestamp, setShouldShowTimestamp] =
    useLocalStorage<boolean>("should-show-timestamp");
  const [userKey, setUserKey, remove] =
    useLocalStorage<string>("user-openai-apikey");
  const { loading, summary, resetSummary, summarize } =
    useSummarize(showSingIn);
  const { toast } = useToast();
  const { analytics } = useAnalytics();

  useEffect(() => {
    licenseKey && setUserKey(licenseKey);
  }, [licenseKey]);

  useEffect(() => {
    // https://www.youtube.com/watch?v=DHhOgWPKIKU
    // todo: support redirect from www.youtube.jimmylv.cn/watch?v=DHhOgWPKIKU
    const validatedUrl = getVideoIdFromUrl(
      router.isReady,
      currentVideoUrl,
      urlState,
      searchParams
    );

    console.log("========validatedUrl========", validatedUrl);

    validatedUrl && generateSummary(validatedUrl);
  }, [router.isReady, urlState, searchParams]);

  const validateUrl = (url?: string) => {
    // note: auto refactor by ChatGPT
    const videoUrl = url || currentVideoUrl;
    if (
      !videoUrl.includes("bilibili.com") &&
      !videoUrl.includes("youtube.com")
    ) {
      toast({
        title: "暂不支持此视频链接",
        description: "请输入哔哩哔哩视频长链接，暂不支持b23.tv或av号",
      });
      return;
    }

    // 来自输入框
    if (!url) {
      // -> '/video/BV12Y4y127rj'
      const curUrl = String(videoUrl.split(".com")[1]);
      router.replace(curUrl);
    } else {
      setCurrentVideoUrl(videoUrl);
    }
  };
  const generateSummary = async (url?: string) => {
    resetSummary();
    validateUrl(url);

    const videoUrl = url || currentVideoUrl;
    const { id, service } = getVideoId(videoUrl);
    if (service === VideoService.Youtube && id) {
      setCurrentVideoId(id);
      await summarize(
        { videoId: id, service: VideoService.Youtube },
        { userKey, shouldShowTimestamp }
      );
      return;
    }

    const bvId = extractUrl(videoUrl);
    if (!bvId) {
      return;
    }

    setCurrentVideoId(bvId);
    await summarize(
      { videoId: bvId, service: VideoService.Bilibili },
      { userKey, shouldShowTimestamp }
    );
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 10);
  };
  const onFormSubmit = async (e: any) => {
    e.preventDefault();
    await generateSummary();
    analytics.track("GenerateButton Clicked");
  };
  const handleApiKeyChange = (e: any) => {
    if (!e.target.value) {
      remove();
    }
    setUserKey(e.target.value);
  };

  function handleShowTimestamp(checked: boolean) {
    setShouldShowTimestamp(checked);
    analytics
      .track(`ShowTimestamp Clicked`, {
        videoId: currentVideoId,
        // todo: add video service
        shouldShowTimestamp: checked,
      })
      .then((res) => console.log("tracked!", res))
      .catch(console.error);
    // throw new Error("Sentry Frontend Error");
  }

  return (
    <div className="mt-10 w-full sm:mt-40">
      <UsageDescription />
      <TypingSlogan />
      <UsageAction />
      <UserKeyInput value={userKey} onChange={handleApiKeyChange} />
      <form onSubmit={onFormSubmit} className="grid place-items-center">
        <input
          type="text"
          value={currentVideoUrl}
          onChange={(e) => setCurrentVideoUrl(e.target.value)}
          className="mx-auto mt-10 w-full appearance-none rounded-lg rounded-md border bg-transparent py-2 pl-2 text-sm leading-6 text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={"输入 bilibili.com 视频链接，按下「回车」"}
        />
        <SubmitButton loading={loading} />
        <SwitchTimestamp
          checked={shouldShowTimestamp}
          onCheckedChange={handleShowTimestamp}
        />
      </form>
      {summary && (
        <SummaryResult
          summary={summary}
          currentVideoUrl={currentVideoUrl}
          currentVideoId={currentVideoId}
        />
      )}
    </div>
  );
};

export default Home;
