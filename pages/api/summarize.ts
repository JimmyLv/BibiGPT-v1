import { Redis } from "@upstash/redis";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchSubtitle } from "~/lib/fetchSubtitle";
import { fetchOpenAIResult } from "~/lib/openai/fetchOpenAIResult";
import { getChunckedTranscripts, getSummaryPrompt } from "~/lib/openai/prompt";
import { selectApiKeyAndActivatedLicenseKey } from "~/lib/openai/selectApiKeyAndActivatedLicenseKey";
import { SummarizeParams } from "~/lib/types";
import { isDev } from "~/utils/env";

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
  const { videoConfig, userConfig } = (await req.json()) as SummarizeParams;
  const { userKey, shouldShowTimestamp } = userConfig;
  const { videoId, service } = videoConfig;

  if (!videoId) {
    return new Response("No videoId in the request", { status: 500 });
  }
  const { title, subtitles, descriptionText } = await fetchSubtitle(
    videoId,
    service,
    shouldShowTimestamp
  );
  if (!subtitles && !descriptionText) {
    console.error("No subtitle in the video: ", videoId);
    return new Response("No subtitle in the video", { status: 501 });
  }
  const inputText = subtitles
    ? getChunckedTranscripts(subtitles, subtitles)
    : descriptionText;
  const prompt = getSummaryPrompt(title, inputText, {
    shouldShowTimestamp: subtitles ? shouldShowTimestamp : false,
  });

  try {
    userKey && console.log("========use user apiKey========");
    isDev && console.log("prompt", prompt);
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user" as const, content: prompt }],
      temperature: 0.5,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: userKey ? 400 : 300,
      stream: false,
      n: 1,
    };

    // TODO: need refactor
    const openaiApiKey = await selectApiKeyAndActivatedLicenseKey(
      userKey,
      videoId
    );
    const result = await fetchOpenAIResult(payload, openaiApiKey);
    // TODO: add better logging when dev or prod
    console.log("result", result);
    const redis = Redis.fromEnv();
    const cacheId = shouldShowTimestamp ? `timestamp-${videoId}` : videoId;
    const data = await redis.set(cacheId, result);
    console.log(`video ${cacheId} cached:`, data);

    return NextResponse.json(result);
  } catch (error: any) {
    console.log("API error", error, error.message);
    return NextResponse.json({
      errorMessage: error.message,
    });
  }
}
