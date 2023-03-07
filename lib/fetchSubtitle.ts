import { VideoService } from "~/lib/types";
import { fetchYoutubeSubtitleUrls, SUBTITLE_DOWNLOADER_URL } from "~/lib/youtube/fetchYoutubeSubtitleUrls";
import { find } from "~/utils/fp";
import { fetchBilibiliSubtitleUrls } from "./bilibili/fetchBilibiliSubtitleUrls";

export async function fetchSubtitle(
  videoId: string,
  service?: VideoService,
  shouldShowTimestamp?: boolean
) {
  if (service === VideoService.Youtube) {
    const { title, subtitleList } = await fetchYoutubeSubtitleUrls(videoId);
    if (subtitleList?.length <= 0) {
      return { title, subtitleList: null };
    }
    const betterSubtitle =
      find(subtitleList, { quality: "English" }) ||
      find(subtitleList, { quality: "English (auto" }) ||
      find(subtitleList, { quality: "zh-CN" }) ||
      subtitleList[0];
    if (shouldShowTimestamp) {
      const subtitleUrl = `${SUBTITLE_DOWNLOADER_URL}${betterSubtitle.url}?ext=json`;
      const response = await fetch(subtitleUrl);
      const subtitles = await response.json();
      // console.log("========subtitles========", subtitles);
      const transcripts = subtitles?.map(
        (item: { start: number; lines: string[] }, index: number) => ({
          text: `${item.start}: ${item.lines.join(" ")}`,
          index,
        })
      );
      return { title, subtitles: transcripts };
    }

    const subtitleUrl = `${SUBTITLE_DOWNLOADER_URL}${betterSubtitle.url}?ext=txt`;
    const response = await fetch(subtitleUrl);
    const subtitles = await response.text();
    const transcripts = subtitles
      .split("\r\n\r\n")
      ?.map((text: string, index: number) => ({ text, index }));
    return { title, subtitles: transcripts };
  }

  // const res = await pRetry(async () => await fetchBilibiliSubtitles(videoId), {
  //   onFailedAttempt: (error) => {
  //     console.log(
  //       `Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`
  //     );
  //   },
  //   retries: 2,
  // });
  // @ts-ignore
  const res = await fetchBilibiliSubtitleUrls(videoId);
  const title = res?.title;
  const subtitleList = res?.subtitle?.list;
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
  /*{
      "from": 16.669,
      "to": 18.619,
      "sid": 8,
      "location": 2,
      "content": "让ppt变得更加精彩",
      "music": 0.0
    },*/
  const transcripts = subtitles?.body.map(
    (item: { from: number; content: string }, index: number) => {
      return {
        text: `${item.from}: ${item.content}`,
        index,
      };
    }
  );
  return { title, subtitles: transcripts };
}
