import { extractSentence } from "~/utils/extractSentence";
import { extractTimestamp } from "~/utils/extractTimestamp";

export default function Sentence({
  bvId,
  sentence,
}: {
  bvId: string;
  sentence: string;
}) {
  const baseUrl = `https://www.bilibili.com/video/${bvId}`;

  const matchResult = extractSentence(sentence);
  if (matchResult) {
    const seconds = matchResult[1];
    const { formattedContent, timestamp } = extractTimestamp(matchResult);

    return (
      <li className="mb-2 list-disc">
        <a
          href={`${encodeURI(`${baseUrl}/?t=${seconds}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="z-10 text-sky-400 hover:text-sky-600"
        >
          {timestamp}
        </a>
        {`${formattedContent}`}
      </li>
    );
  }
  return <li className="mb-2 list-disc">{sentence}</li>;
}
