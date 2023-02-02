import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "node-html-parser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.body;

  console.log("url is, ", url);

  if (!url) {
    return res.status(400).json("No prompt in the request");
  }

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    console.log("response status is, ", response.status);

    const data = await response.text();

    // console.log("data is, ", data);

    const root = parse(data);
    const body = root.querySelector(".article-content");
    const text = body!.innerText
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace(/(\r\t|\t|\r)/gm, "");

    console.log("text is, ", text);
    const prompt = `Summarize the following news article in a few sentences and do not start with a period: ${text}`;

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

    const responseOpenAI = await fetch(
      "https://api.openai.com/v1/completions",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
        },
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    const json = await responseOpenAI.json();

    return res.status(200).json(json);

    // const stream = await OpenAIStream(payload);
    // return new Response(stream);
  } catch (e: any) {
    console.log({ e });
    return res.status(400).json(e);
  }
}
