import { sample } from "~/utils/fp";

export const fetchBilibiliSubtitleUrls = async (bvId: string) => {
  const requestUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvId}`;
  console.log(`fetch`, requestUrl);
  const sessdata = sample(process.env.BILIBILI_SESSION_TOKEN?.split(","));
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    Host: "api.bilibili.com",
    Cookie: `SESSDATA=${sessdata}`
  };
  const response = await fetch(requestUrl, {
    method: "GET",
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    headers,
    referrerPolicy: "no-referrer" // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  });
  const json = await response.json();
  // return json.data.View;
  // { code: -404, message: '啥都木有', ttl: 1 }
  return json.data;
};
