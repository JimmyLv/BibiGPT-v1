import React from "react";

export function ActionsAfterResult({
  curVideo,
  onCopy,
}: {
  curVideo: string;
  onCopy: () => void;
}) {
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
    </div>
  );
}
