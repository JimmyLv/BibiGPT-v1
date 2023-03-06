import { Poppins } from "@next/font/google";
import clsx from "clsx";
import Image from "next/image";
import React from "react";
import SignIn from "~/components/SignIn";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { BASE_DOMAIN } from "~/utils/constants";
import Github from "../components/GitHub";
const poppins = Poppins({ weight: "800", subsets: ["latin"] });

export default function Header() {
  return (
    <header className="supports-backdrop-blur:bg-white/60 max-w-8xl sticky top-0 z-40 mx-auto mx-4 w-full flex-none border-b border-slate-900/10 bg-white/95 pt-2  backdrop-blur transition-colors duration-500 dark:border-slate-50/[0.06] dark:border-slate-300/10 dark:bg-transparent lg:z-50 lg:mx-0 lg:border-0 lg:border-b lg:border-slate-900/10 lg:px-8">
      <div className="flex items-center justify-between px-3 sm:px-3">
        <div className="flex items-center space-x-3">
          <a
            href="https://space.bilibili.com/37648256"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/video.png"
              alt="logo"
              className="animate-bounce"
              width={50}
              height={50}
            />
          </a>
          <a href={BASE_DOMAIN}>
            <h2 className={clsx("text-lg sm:text-2xl", poppins.className)}>
              <span className="text-pink-400">哔哩哔哩</span> BibiGPT
            </h2>
          </a>
          <div
            id="banner"
            className="z-50 mx-4 flex hidden w-auto justify-center border-b border-slate-900/10 py-4 dark:border-slate-300/10 lg:mx-0 lg:block lg:border-0 lg:px-8"
          >
            <a
              className="ml-3 hidden items-center rounded-full bg-sky-400/10 py-1 px-3 text-xs font-medium leading-5 text-sky-600 hover:bg-sky-400/20 dark:text-sky-400 xl:flex"
              href="/release"
            >
              <strong className="font-semibold">更新日志 v0.0.1</strong>
              <svg
                width="2"
                height="2"
                fill="currentColor"
                aria-hidden="true"
                className="ml-2 text-sky-600 dark:text-sky-400/70"
              >
                <circle cx="1" cy="1" r="1"></circle>
              </svg>
              <span className="ml-2 min-[1372px]:hidden">开发者日记</span>
              <span className="ml-2 hidden min-[1372px]:inline">
                开发者日记
              </span>
              <svg
                width="3"
                height="6"
                className="ml-3 overflow-visible text-sky-300 dark:text-sky-400"
                aria-hidden="true"
              >
                <path
                  d="M0 0L3 3L0 6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </a>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-5">
          <Tooltip>
            <TooltipTrigger>
              <a
                href="https://jimmylv.feishu.cn/share/base/form/shrcn9PwPzGGGiJCnH0JNfM1P3b"
                rel="noreferrer noopener"
                target="_blank"
                className="flex items-center space-x-2"
              >
                🔥<span className="hidden pl-1 sm:block">提</span>反馈
              </a>
            </TooltipTrigger>
            <TooltipContent>那可太感谢啦！</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <a
                href="javascript:(function(){if(!window.location.hostname
  .includes('bilibili.com')){alert('🔖请进入B站视频页面再点击书签哦！')};location.href=location.href.replace('bilibili.com','bilibili.jimmylv.cn')}())"
                rel="noreferrer noopener"
                target="_blank"
                className="flex hidden items-center space-x-2 sm:block"
                aria-label="书签版"
                onClick={() =>
                  alert("🔖请拖至书签栏，进入B站视频页面再点击书签哦！")
                }
              >
                🔖
                <span className="relin-paragraph-target pl-1 text-slate-500">
                  (书签版)
                </span>
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>🔖请拖至书签栏，进入B站视频页面再点击书签哦！</p>
            </TooltipContent>
          </Tooltip>
          <a
            href={BASE_DOMAIN + "/ios"}
            rel="noreferrer noopener"
            target="_blank"
            className="flex items-center space-x-2"
            aria-label="iOS版"
          >
            <Image
              src="/shortcuts.png"
              alt="logo"
              width={33}
              height={33}
              className="max-w-none"
            />
            <span className="relin-paragraph-target hidden text-slate-500 sm:block">
              (iOS版)
            </span>
          </a>
          <a
            href="https://github.com/JimmyLv/BiliGPT"
            rel="noreferrer noopener"
            target="_blank"
            className=""
          >
            <Github width="33" height="33" />
          </a>
          <SignIn />
        </div>
      </div>
    </header>
  );
}
