import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  url: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.info("b23.tv: ", req.query);
  // https://b23.tv/MP6B0qw
  // @ts-ignore
  let response = await fetch(req.query.url);
  console.info("convert: ", response.url);
  res.status(200).json({ url: response.url });
}
