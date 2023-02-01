import { Poppins } from "@next/font/google";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import Github from "../components/GitHub";

const poppins = Poppins({ weight: "800", subsets: ["latin"] });

export default function Header() {
  return (
    <div className="flex justify-between">
      <Link className="flex items-center space-x-3" href="/">
        <Image src="/edit.png" alt="logo" width={34} height={34} />
        <h2 className={clsx("text-3xl", poppins.className)}>
          <span className="text-green-500">TechCrunch</span> summarizer.
        </h2>
      </Link>
      <a
        href="https://github.com/Nutlope?tab=repositories"
        rel="noreferrer noopener"
        target="_blank"
      >
        <Github />
      </a>
    </div>
  );
}
