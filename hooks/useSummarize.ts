import { useState } from "react";
import { toast } from "react-hot-toast";

export function useSummarize() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");

  const resetSummary = () => {
    setSummary("");
  };

  const summarize = async (bvId: string, apiKey: string | undefined) => {
    setSummary("");
    setLoading(true);

    try {
      setLoading(true);
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bvId, apiKey }),
      });

      if (response.redirected) {
        window.location.href = response.url;
      }

      if (!response.ok) {
        console.log("error", response);
        if (response.status === 501) {
          toast.error("啊叻？视频字幕不见了？！");
        } else if (response.status === 504) {
          toast.error("网站访问量大，每日限额使用 5 次哦！");
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
    } catch (e: unknown) {
      console.error("[fetch ERROR]", e);
      if (e instanceof Error && e?.name === "AbortError") {
        setLoading(false);
        toast.error("timeoutError");
      } else {
        setLoading(false);
        toast.error("internalServerError");
      }
    }
  };
  return { loading, summary, resetSummary, summarize };
}
