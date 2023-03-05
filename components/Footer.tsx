import Link from "next/link";
import { ModeToggle } from "~/components/mode-toggle";
import { Icons } from "./icons";
import { buttonVariants } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="mt-5 mb-3 flex h-16 w-full flex-col items-center justify-between space-y-3 px-3 pt-4 text-center text-slate-400 sm:mb-0 sm:h-20 sm:flex-row sm:pt-2">
      <div>
        Thanks to{" "}
        <a
          href="https://openai.com/"
          target="_blank"
          rel="noreferrer"
          className="font-bold underline-offset-2 transition hover:text-pink-400 hover:underline"
        >
          OpenAI{" "}
        </a>
        and{" "}
        <a
          href="https://vercel.com/"
          target="_blank"
          rel="noreferrer"
          className="font-bold underline-offset-2 transition hover:text-pink-400 hover:underline"
        >
          Vercel Edge Functions.
        </a>
      </div>
      <div className="flex items-center space-x-1">
        <Link
          href="https://github.com/haolin29/CantonGPT"
          className="group"
          aria-label="Haolin on GitHub"
        >
          <div
            className={buttonVariants({
              size: "sm",
              variant: "ghost",
              className: "text-slate-700 dark:text-slate-400",
            })}
          >
            <Icons.gitHub className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </div>
        </Link>
        <ModeToggle />
      </div>
    </footer>
  );
}
