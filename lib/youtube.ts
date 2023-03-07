import ytdl from "ytdl-core";

// interface SubtitleResponse {
//   title: string;
//   subtitles: string[];
// }

export async function getVideoInfo(videoId: string) {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const videoInfo = await ytdl.getInfo(videoUrl);
    const title = videoInfo.videoDetails.title;
    const subtitles = videoInfo.player_response.captions
      ? videoInfo.player_response.captions.playerCaptionsTracklistRenderer
          .captionTracks.map((track) => track.baseUrl)
      : [];
    console.log("title", title);
    console.log("subtitles", subtitles);
    return { title, subtitles };
  } catch (error) {
    console.error(`Error retrieving video info: ${error}`);
    return { title: "", subtitles: [] };
  }
}