import { getSubtitles } from "yt-subtitles";
// const youtube = google.youtube({
//     version: 'v3',
//     auth: process.env.YOUTUBE_API_KEY,
// });


export async function fetchSubtitle(videoId: string) {
    // const response = await youtube.captions.list({
    //     videoId,
    // });
    
    // let captionTrackId = null;
    
    // const subtitleList = response?.data?.items;
    
    // const subtitleItem = subtitleList?.find(item => item?.snippet?.language === 'en');
    // if (subtitleItem) {
    //     captionTrackId = subtitleItem.id;
    // }
    
    // const subtitleResponse = await youtube.captions.download({
    //     id: captionTrackId,
    //     tfmt: 'vtt',
    // });
    
    // const subtitleData = subtitleResponse.data;
    // const subtitles = fromVtt(subtitleData);

    const subtitles =  await getSubtitles(videoId, "en");

    console.log(subtitles);
      
    return { subtitles };
}

