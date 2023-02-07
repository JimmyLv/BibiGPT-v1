import { Poppins } from "@next/font/google";
import clsx from "clsx";
import Image from "next/image";
import Github from "../components/GitHub";

const poppins = Poppins({ weight: "800", subsets: ["latin"] });

export default function Header() {
  return (
    <div className="flex items-center justify-between px-3 sm:px-3">
      <a
        className="flex items-center space-x-3"
        href="https://www.techcrunchsummary.com"
      >
        <Image src="/edit.png" alt="logo" width={34} height={34} />
        <h2 className={clsx("text-lg sm:text-3xl", poppins.className)}>
          <span className="text-green-500">TechCrunch</span> summarizer
        </h2>
      </a>
      <a
        href="https://github.com/Nutlope/news-summarizer"
        rel="noreferrer noopener"
        target="_blank"
        className=""
      >
        <Github width="33" height="33" />
      </a>
    </div>
  );
}
