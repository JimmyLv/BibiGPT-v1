import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useSaveToFlomo } from "~/hooks/notes/flomo";
import { useLocalStorage } from "~/hooks/useLocalStorage";

export function ActionsAfterResult({
  curVideo,
  onCopy,
  summaryNote,
}: {
  curVideo: string;
  summaryNote: string;
  onCopy: () => void;
}) {
  const [flomoWebhook] = useLocalStorage<string>("user-flomo-webhook");
  const { loading, save } = useSaveToFlomo(summaryNote, flomoWebhook || "");

  return (
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
      <button
        className="w-24 cursor-pointer rounded-lg bg-sky-400 px-2 py-1 text-center font-medium text-white hover:bg-sky-400/80"
        onClick={onCopy}
      >
        一键复制
      </button>
      {flomoWebhook ? (
        <button
          className="flex w-44 cursor-pointer items-center justify-center rounded-lg bg-green-400 px-2 py-1 text-center font-medium text-white hover:bg-green-400/80"
          onClick={save}
        >
          {loading ? (
            <Image src="/loading.svg" alt="Loading..." width={28} height={28} />
          ) : (
            "一键保存到 Flomo"
          )}
        </button>
      ) : (
        <Link
          className="flex w-44 cursor-pointer items-center justify-center rounded-lg bg-green-400 px-2 py-1 text-center font-medium text-white hover:bg-green-400/80"
          href="/user/integration"
          target="_blank"
        >
          📒 一键保存到笔记
        </Link>
      )}
    </div>
  );
}
