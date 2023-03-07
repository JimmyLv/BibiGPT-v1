import React from "react";
import { ActionsAfterResult } from "~/components/ActionsAfterResult";
import Sentence from "~/components/Sentence";
import { useToast } from "~/hooks/use-toast";
import { formatSummary } from "~/utils/formatSummary";

export let isSecureContext = false;

if (typeof window !== "undefined") {
  isSecureContext = window.isSecureContext;
}

export function SummaryResult({
  currentVideoUrl,
  currentVideoId,
  summary,
}: {
  currentVideoUrl: string;
  currentVideoId: string;
  summary: string;
}) {
  const { toast } = useToast();
  const { summaryArray, formattedSummary } = formatSummary(summary);

  const handleCopy = () => {
    if (!isSecureContext) {
      toast({ description: "复制错误 ❌" });
      return;
    }
    // todo: add the youtube video id
    navigator.clipboard.writeText(
      formattedSummary +
        "\n\n #BibiGPT自动总结 b.jimmylv.cn @吕立青_JimmyLv \nBV1fX4y1Q7Ux"
    );
    toast({ description: "复制成功 ✂️" });
  };

  return (
    <div className="mb-8 px-4">
      <h3 className="m-8 mx-auto max-w-3xl border-t-2 border-dashed pt-8 text-center text-2xl font-bold sm:text-4xl">
        <a
          href={currentVideoUrl}
          className="hover:text-pink-600 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          {`【📝 总结：${currentVideoId}】`}
        </a>
      </h3>
      <div
        className="mx-auto mt-6 max-w-3xl cursor-copy rounded-xl border-2 bg-white p-4 text-lg leading-7 shadow-md transition hover:bg-gray-50"
        onClick={handleCopy}
      >
        {summaryArray.map((sentence, index) => (
          <div key={index}>
            {sentence.length > 0 && (
              <Sentence
                videoId={currentVideoId}
                videoUrl={currentVideoUrl}
                sentence={sentence}
              />
            )}
          </div>
        ))}
      </div>
      <ActionsAfterResult curVideo={currentVideoUrl} onCopy={handleCopy} />
    </div>
  );
}
