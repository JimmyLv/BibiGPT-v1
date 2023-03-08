import { Redis } from "@upstash/redis";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchSubtitle } from "~/lib/fetchSubtitle";
import { ChatGPTAgent, fetchOpenAIResult } from "~/lib/openai/fetchOpenAIResult";
import { getSmallSizeTranscripts } from "~/lib/openai/getSmallSizeTranscripts";
import { getSystemPrompt, getUserSubtitlePrompt } from "~/lib/openai/prompt";
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
  const { title, subtitlesArray, descriptionText } = await fetchSubtitle(
    videoId,
    service,
    shouldShowTimestamp
  );
  if (!subtitlesArray && !descriptionText) {
    console.error("No subtitle in the video: ", videoId);
    return new Response("No subtitle in the video", { status: 501 });
  }
  const inputText = subtitlesArray
    ? getSmallSizeTranscripts(subtitlesArray, subtitlesArray)
    : descriptionText;
  const systemPrompt = getSystemPrompt({
    shouldShowTimestamp: subtitlesArray ? shouldShowTimestamp : false,
  });
  const userPrompt = getUserSubtitlePrompt(title, inputText);
  if (isDev) {
    console.log("final system prompt: ", systemPrompt);
    console.log("final user prompt: ", userPrompt);
  }

  try {
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: ChatGPTAgent.system,
          content: systemPrompt,
        },
        // {"role": "user", "content": "谁赢得了2020年的世界职业棒球大赛?"},
        // {"role": "assistant", "content": "洛杉矶道奇队在2020年赢得了世界职业棒球大赛冠军。"},
        { role: ChatGPTAgent.user, content: userPrompt },
      ],
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
