import { find } from "lodash";
// import { VideoService } from "~/lib/types";

type CaptionSnippet = {
  videoId: string;
  language: string;
  trackKind: "asr" | "standard" | "forced";
};
type YouTubeCaptionType = {
  id: string;
  snippet: CaptionSnippet;
};

export async function fetchYoutubeSubtitleOfficially(videoId: string) {
  // https://github.com/adamrichardson14/youtubestatistics/blob/completed/pages/videos.jsx#L37
  // https://developers.google.com/youtube/v3/docs/captions/list?hl=zh-cn0拍；、*IK《0拍；、3edc
  /*
  * ASR – A caption track generated using automatic speech recognition.
  forced – A caption track that plays when no other track is selected in the player. For example, a video that shows aliens speaking in an alien language might have a forced caption track to only show subtitles for the alien language.
  standard – A regular caption track. This is the default value.
  * */
  const subtitleListUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}`;
  const response = await fetch(
    `${subtitleListUrl}&key=${process.env.YOUTUBE_DATA_API_TOKEN}`
  );
  const json = await response.json();
  const subtitles = json.items;
  console.log("========response========", subtitles);
  if (subtitles?.length > 0) {
    /*
     *   trackKind: 'standard', language: 'en',
     *   trackKind: 'asr', language: 'en',
     * */
    const betterSubtitle =
      find(subtitles, { trackKind: "standard" }) ||
      find(subtitles, { language: "zh-CN" }) ||
      find(subtitles, { language: "en" }) ||
      subtitles[0];
    const subtitleUrl = `https://www.googleapis.com/youtube/v3/captions/${betterSubtitle.id}`;
    const response = await fetch(
      `${subtitleUrl}&key=${process.env.YOUTUBE_DATA_API_TOKEN}`
    );
    // throw oauth2 error
    console.log("========subtitleUrl response========", await response.json());
  }
}
