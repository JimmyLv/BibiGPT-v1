import type { NextApiRequest, NextApiResponse } from "next";
import { getChunckedTranscripts, getSummaryPrompt } from "../../utils/prompt";

export const config = {
  // runtime: "edge",
};

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}
export default async function handler(req: NextApiRequest, nextRes: NextApiResponse) {
  const { url, apiKey } = req.body as {
    url?: string;
    apiKey?: string;
  };
  console.log('========req========', req.body)

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
    apiKey && console.log("========use user key========");
    console.log("bvid_url", url);
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

    console.log("========prompt========", prompt);
    const chatgptRes = await fetch(
      "https://chatgpt-jimmylv-cn.ngrok.io/message",
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          message: prompt,
        }),
      }
    );
    const data = await chatgptRes.json();
    console.log("========data========", data);
    return nextRes.json(data);
    // return await fetchOpenAPI(prompt, apiKey);
  } catch (error: any) {
    console.log(error);
    return new Response(error, { status: 500 });
  }
}
