import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "node-html-parser";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // get this from body.req
  const url =
    "https://techcrunch.com/2023/01/23/spotify-cuts-6-of-its-workforce-impacting-600-people/";

  const response = await fetch(url, {
    method: "GET",
  });

  const data = await response.text();

  // parse the data to extract the <body> tag with node-html-parser
  const root = parse(data);
  const body = root.querySelector(".content");
  const bodyText = body!.innerText
    .replace(/(\r\n|\n|\r)/gm, "")
    .replace(/(\r\t|\t|\r)/gm, "");

  res.status(200).json({ name: bodyText });
}
