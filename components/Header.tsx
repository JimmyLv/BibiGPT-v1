import { Poppins } from "@next/font/google";
import clsx from "clsx";
import Image from "next/image";
import Github from "../components/GitHub";

const poppins = Poppins({ weight: "800", subsets: ["latin"] });

export default function Header() {
  return (
    <div className="flex items-center justify-between px-3 sm:px-3">
      <a className="flex items-center space-x-3" href="https://b.jimmylv.cn">
        <Image src="/video.png" alt="logo" className="animate-bounce" width={50} height={50} />
        <h2 className={clsx("text-lg sm:text-3xl", poppins.className)}>
          <span className="text-pink-400	">哔哩哔哩</span> BiliGPT
        </h2>
      </a>
      <div className="flex items-center space-x-5">
        <a
          href="https://b.jimmylv.cn/ios"
          rel="noreferrer noopener"
          target="_blank"
          className="flex items-center space-x-2"
        >
          <Image src="/shortcuts.png" alt="logo" width={33} height={33} />
          <span className="text-slate-500 relin-paragraph-target">(iOS版)</span>
        </a>
        <a
          href="https://github.com/JimmyLv/chat-bilibili-video"
          rel="noreferrer noopener"
          target="_blank"
          className=""
        >
          <Github width="33" height="33" />
        </a>
      </div>
    </div>
  );
}
