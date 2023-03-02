import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { NextFetchEvent, NextRequest } from "next/server";
import fetchSubtitle from "../../utils/fetchSubtitle";
import { OpenAIResult } from "../../utils/OpenAIResult";
import { getChunckedTranscripts, getSummaryPrompt } from "../../utils/prompt";

export const config = {
  runtime: "edge",
};

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export default async function handler(
  req: NextRequest,
  context: NextFetchEvent
) {
  // TODO: rename the bvId to cache id?
  const { bvId, apiKey } = (await req.json()) as {
    bvId: string;
    apiKey?: string;
  };

  apiKey && console.log("========use user key========");

  try {
    const video = await fetchSubtitle(bvId);
    if (!video?.transcripts) {
      return new Response("No subtitle in the video", { status: 501 });
    }

    const { title, transcripts } = video;
    // console.log("========transcripts========", transcripts);
    const smallerTranscripts = getChunckedTranscripts(transcripts, transcripts);
    const prompt = getSummaryPrompt(title, smallerTranscripts);

    const payload = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user" as const, content: prompt }],
      temperature: 0.5,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: apiKey ? 400 : 300,
      stream: false,
      n: 1,
    };

    const result = await OpenAIResult(payload, apiKey);
    console.log("result", result);
    const redis = Redis.fromEnv();
    const data = await redis.set(bvId, result);
    console.log(`bvId ${bvId} cached:`, data);

    return NextResponse.json(result);
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({
      errorMessage: error.message,
    });
  }
}
