import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  url: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("========b23.tv URL========", req.query);
  // https://b23.tv/MP6B0qw
  // @ts-ignore
  let response = await fetch(req.query.url);
  console.log("======response.url=======", response.url);
  res.status(200).json({ url: response.url });
}
