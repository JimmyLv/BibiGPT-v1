import { VideoService } from "./types";
import { fetchBilibiliSubtitle } from "./bilibili/fetchBilibiliSubtitle";
import { fetchYoutubeSubtitle } from "./youtube/fetchYoutubeSubtitle";

export async function fetchSubtitle(
  videoId: string,
  service?: VideoService,
  shouldShowTimestamp?: boolean
): Promise<{
  title: string;
  subtitlesArray?: null | Array<{ index: number; text: string }>;
  descriptionText?: string;
}> {
  if (service === VideoService.Youtube) {
    return await fetchYoutubeSubtitle(videoId, shouldShowTimestamp);
  }
  return await fetchBilibiliSubtitle(videoId);
}
