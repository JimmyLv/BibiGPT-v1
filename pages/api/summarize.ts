import { NextRequest } from "next/server";
import { parse } from "node-html-parser";
import { OpenAIStream } from "../../utils/OpenAIStream";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  const { url } = (await req.json()) as {
    url?: string;
  };

  if (!url) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const response = await fetch(url, {
    method: "GET",
  });

  const data = await response.text();
  const root = parse(data);
  const body = root.querySelector(".article-content");
  const text = body!.innerText
    .replace(/(\r\n|\n|\r)/gm, "")
    .replace(/(\r\t|\t|\r)/gm, "");

  const prompt = `Summarize the following news article in a few sentences and do not start with a period: ${text}`;

  const payload = {
    model: "text-davinci-003",
    prompt,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
}
