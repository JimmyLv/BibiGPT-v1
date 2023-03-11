import React from "react";
import { Sidebar } from "~/components/sidebar";
import { useLocalStorage } from "~/hooks/useLocalStorage";

export default () => {
  const [flomoWebhook, setFlomoWebhook] =
    useLocalStorage<string>("user-flomo-webhook");

  const handleFlomoWebhook = (e: any) => {
    setFlomoWebhook(e.target.value);
  };

  return (
    <>
      <Sidebar />
      <div className="p-4">
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700">
          <div className="mb-4 flex flex-col p-6 h-48 justify-center rounded bg-gray-50 dark:bg-gray-800">
            <h2 className="text-2xl dark:text-gray-500">Flomo 浮墨笔记</h2>
            <div className="text-lg text-slate-700 dark:text-slate-400">
              <input
                value={flomoWebhook}
                onChange={handleFlomoWebhook}
                className="mx-auto my-4 w-full appearance-none rounded-lg rounded-md border bg-transparent py-2 pl-2 text-sm leading-6 text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  "填你的 Flomo API Webhook 链接: https://flomoapp.com/iwh/M000000y/d8d123456"
                }
              />
              <div className="relin-paragraph-target mt-1 text-base text-slate-500">
                <div>
                  如何获取你自己的 Flomo 专属记录 API
                  <a
                    href="https://v.flomoapp.com/mine?source=incoming_webhook"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 mb-6 pl-2 font-semibold text-sky-500 dark:text-sky-400"
                  >
                    https://v.flomoapp.com/mine?source=incoming_webhook
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="flex h-28 items-center justify-center rounded bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl text-gray-400 dark:text-gray-500">
                Roam (coming soon)
              </p>
            </div>
            <div className="flex h-28 items-center justify-center rounded bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl text-gray-400 dark:text-gray-500">
                Notion (coming soon)
              </p>
            </div>
          </div>
          <div className="mb-4 flex h-48 items-center justify-center rounded bg-gray-50 dark:bg-gray-800">
            <p className="text-2xl text-gray-400 dark:text-gray-500">
              💺 虚伪以待，欢迎 PR！
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex h-28 items-center justify-center rounded bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl text-gray-400 dark:text-gray-500">+</p>
            </div>
            <div className="flex h-28 items-center justify-center rounded bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl text-gray-400 dark:text-gray-500">+</p>
            </div>
            <div className="flex h-28 items-center justify-center rounded bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl text-gray-400 dark:text-gray-500">+</p>
            </div>
            <div className="flex h-28 items-center justify-center rounded bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl text-gray-400 dark:text-gray-500">+</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
