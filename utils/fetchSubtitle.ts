export default async function fetchSubtitle(bvId: string) {
  const requestUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvId}`;
  console.log(`fetch`, requestUrl);
  try {
    const response = await fetch(requestUrl, { method: "GET" });
    const video = await response.json();

    const title = video.data?.title;
    const subtitleList = video.data?.subtitle?.list;
    if (subtitleList && subtitleList.length < 1) {
      console.error("啊叻？视频字幕不见了？！");
      return;
    }

    const betterSubtitle =
      subtitleList.find(({ lan }: { lan: string }) => lan === "zh-CN") ||
      subtitleList?.[0];
    const subtitleUrl = betterSubtitle?.subtitle_url;
    console.log("subtitle_url", subtitleUrl);

    const subtitleResponse = await fetch(subtitleUrl);
    const subtitles = await subtitleResponse.json();

    // @ts-ignore
    const transcripts = subtitles.body.map((item, index) => {
      return {
        text: item.content,
        index,
        timestamp: item.from,
      };
    });
    return { title, transcripts };
  } catch (e: any) {
    console.error(e);
    throw new Error("请求 B 站 API 出错", e);
  }
}
