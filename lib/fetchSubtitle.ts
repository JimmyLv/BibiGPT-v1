import { fetchBilibiliSubtitle } from "./bilibili/fetchBilibiliSubtitle";
import { CommonSubtitleItem, VideoService } from "./types";
import { fetchYoutubeSubtitle } from "./youtube/fetchYoutubeSubtitle";

export async function fetchSubtitle(
  videoId: string,
  service?: VideoService,
  shouldShowTimestamp?: boolean
): Promise<{
  title: string;
  subtitlesArray?: null | Array<CommonSubtitleItem>;
  descriptionText?: string;
}> {
  if (service === VideoService.Youtube) {
    return await fetchYoutubeSubtitle(videoId, shouldShowTimestamp);
  }
  return await fetchBilibiliSubtitle(videoId, shouldShowTimestamp);
}
