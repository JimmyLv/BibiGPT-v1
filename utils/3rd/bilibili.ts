import pRetry from "p-retry";

const run = async (bvId: string) => {
  const requestUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvId}`;
  console.log(`fetch`, requestUrl);
  const response = await fetch(requestUrl, {
    method: "GET",
  });
  const json = await response.json();
  const subtitleList = json.data?.subtitle?.list;
  if (!subtitleList || subtitleList?.length < 1) {
    throw new Error("no subtitle");
  }

  return json;
};

export async function fetchSubtitle(bvId: string) {
  const res = await pRetry(() => run(bvId), {
    onFailedAttempt: (error) => {
      console.log(
        `Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`
      );
    },
    retries: 2,
  });
  // @ts-ignore
  const title = res.data?.title;
  const subtitleList = res.data?.subtitle?.list;
  if (!subtitleList || subtitleList?.length < 1) {
    return { title, subtitles: null };
  }

  const betterSubtitle =
    subtitleList.find(({ lan }: { lan: string }) => lan === "zh-CN") ||
    subtitleList[0];
  const subtitleUrl = betterSubtitle?.subtitle_url;
  console.log("subtitle_url", subtitleUrl);

  const subtitleResponse = await fetch(subtitleUrl);
  const subtitles = await subtitleResponse.json();
  return { title, subtitles };
}
