import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "node-html-parser";

type Data = {
  text: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const url = req.body.article;

  if (!url) {
    return res.status(400).json({ text: "No article in the request" });
  }

  console.log({ url });
  const response = await fetch(url, {
    method: "GET",
  });

  const data = await response.text();
  const root = parse(data);
  const body = root.querySelector(".article-content");
  console.log({ body });
  const text = body!.innerText
    .replace(/(\r\n|\n|\r)/gm, "")
    .replace(/(\r\t|\t|\r)/gm, "");

  const prompt = `Summarize the following news article in a few sentences: ${text}`;

  const payload = {
    model: "text-davinci-003",
    prompt,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: false,
    n: 1,
  };

  const openAIresponse = await fetch("https://api.openai.com/v1/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  const json = await openAIresponse.json();

  console.log({ json });

  res.status(200).json({ text: json.choices[0].text });
}
