import { fetchYoutubeSubtitleUrls, SUBTITLE_DOWNLOADER_URL } from "~/lib/youtube/fetchYoutubeSubtitleUrls";
import { find } from "~/utils/fp";

export async function fetchYoutubeSubtitle(
  videoId: string,
  shouldShowTimestamp: boolean | undefined
) {
  const { title, subtitleList } = await fetchYoutubeSubtitleUrls(videoId);
  if (subtitleList?.length <= 0) {
    return { title, subtitlesArray: null };
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
    // TODO: merge timestamp by trunk
    const transcripts = subtitles?.map(
      (item: { start: number; lines: string[] }, index: number) => ({
        text: `${item.start}: ${item.lines.join(" ")}`,
        index
      })
    );
    return { title, subtitlesArray: transcripts };
  }

  const subtitleUrl = `${SUBTITLE_DOWNLOADER_URL}${betterSubtitle.url}?ext=txt`;
  const response = await fetch(subtitleUrl);
  const subtitles = await response.text();
  const transcripts = subtitles
    .split("\r\n\r\n")
    ?.map((text: string, index: number) => ({ text, index }));
  return { title, subtitlesArray: transcripts };
}
