import { useState } from "react";
import { useToast } from "~/hooks/use-toast";
import { UserConfig, VideoConfig } from "~/lib/types";
import { RATE_LIMIT_COUNT } from "~/utils/constants";

export function useSummarize(showSingIn: (show: boolean) => void) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const { toast } = useToast();

  const resetSummary = () => {
    setSummary("");
  };

  const summarize = async (
    videoConfig: VideoConfig,
    userConfig: UserConfig
  ) => {
    setSummary("");
    setLoading(true);

    try {
      setLoading(true);
      const response = await fetch("/api/sumup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoConfig,
          userConfig,
        }),
      });

      if (response.redirected) {
        window.location.href = response.url;
      }

      if (!response.ok) {
        console.log("error", response);
        if (response.status === 501) {
          toast({
            title: "啊叻？视频字幕不见了？！",
            description: `\n（这个视频太短了...\n或者还没有字幕哦！）`,
          });
        } else if (response.status === 504) {
          toast({
            variant: "destructive",
            title: `网站访问量过大`,
            description: `每日限额使用 ${RATE_LIMIT_COUNT} 次哦！`,
          });
        } else if (response.status === 401) {
          toast({
            variant: "destructive",
            title: `${response.statusText} 请登录哦！`,
            // ReadableStream can't get error message
            // description: response.body
            description: "每天的免费次数已经用完啦，🆓",
          });
          showSingIn(true);
        } else {
          toast({
            variant: "destructive",
            title: response.statusText,
            // ReadableStream can't get error message
            // description: response.body
          });
        }
        setLoading(false);
        return;
      }

      // await readStream(response, setSummary);
      const result = await response.json();
      if (result.errorMessage) {
        setLoading(false);
        toast({
          variant: "destructive",
          title: "API 请求出错，请重试。",
          description: result.errorMessage,
        });
        return;
      }
      setSummary(result);
      setLoading(false);
    } catch (e: any) {
      console.error("[fetch ERROR]", e);
      toast({
        variant: "destructive",
        title: "未知错误：",
        description: e.message || e.errorMessage,
      });
      setLoading(false);
    }
  };
  return { loading, summary, resetSummary, summarize };
}
