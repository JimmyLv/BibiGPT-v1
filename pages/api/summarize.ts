import { omitBy } from "lodash";
import { OpenAIStream } from "../../utils/OpenAIStream";
import { getChunckedTranscripts, getSummaryPrompt } from "../../utils/prompt";

export const config = {
  runtime: "edge",
};

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export default async function handler(req: Request) {
  const { url, apiKey } = (await req.json()) as {
    url?: string;
    apiKey?: string;
  };

  if (!url) {
    return new Response("No prompt in the request", { status: 500 });
  }

  try {
    const matchResult = url.match(/\/video\/([^\/\?]+)/);
    let bvId: string | undefined;
    if (matchResult) {
      bvId = matchResult[1];
    }
    // console.log("========url========", url, matchResult, bvId);
    const response = await fetch(
      `https://api.bilibili.com/x/web-interface/view?bvid=${bvId}`,
      {
        method: "GET",
      }
    );
    const res = await response.json();
    // @ts-ignore
    const title = res.data?.title;
    const subtitleUrl = res.data?.subtitle?.list?.[0]?.subtitle_url;
    console.log("subtitle_url", subtitleUrl);
    if (!subtitleUrl) {
      return new Response("No subtitle in the video", { status: 501 });
    }

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
    // console.log("========transcripts========", transcripts);
    const text = getChunckedTranscripts(transcripts, transcripts);
    const prompt = getSummaryPrompt(title, text);

    const payload = {
      model: "text-davinci-003",
      prompt,
      temperature: 0.5,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 400,
      stream: true,
      n: 1,
    };

    const stream = await OpenAIStream(payload, apiKey);
    return new Response(stream);
  } catch (error: any) {
    console.log(error);
    return new Response(error, { status: 500 });
  }
}
