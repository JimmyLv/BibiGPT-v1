import { parse } from "node-html-parser";
import { OpenAIStream } from "../../utils/OpenAIStream";

export const config = {
  runtime: "edge",
};

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export default async function handler(req: Request) {
  const { url } = (await req.json()) as {
    url?: string;
  };

  if (!url) {
    return new Response("No prompt in the request", { status: 500 });
  }

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    const data = await response.text();

    const root = parse(data);
    const body = root.querySelector(".article-content");
    const text = body!.innerText
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace(/(\r\t|\t|\r)/gm, "");

    const prompt = `I want you to act like a news article summarizer. I will input a news article and your job is to convert them into a useful summary of a few sentences. Do not repeat sentences and make sure all sentences are clear and complete: "${text}"`;

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
  } catch (e: any) {
    console.log({ e });
    return new Response(e, { status: 500 });
  }
}
