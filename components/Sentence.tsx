export default function Sentence({
  bvId,
  sentence,
}: {
  bvId: string;
  sentence: string;
}) {
  const baseUrl = `https://www.bilibili.com/video/${bvId}`;

  const matchResult = sentence.match(/\s*(\d+\.\d+)(.*)/);
  let timestamp: string | undefined;
  if (matchResult) {
    console.log("========matchResult========", matchResult);
    const seconds = Number(matchResult[1]);
    const hours = Math.floor(seconds / 3600);
    const remainingSeconds = Math.floor(seconds % 3600);
    const minutes = Math.floor(remainingSeconds / 60);
    const remainingMinutes = Math.floor(remainingSeconds % 60);
    if (hours > 0) {
      timestamp = `${hours}:${minutes
        .toString()
        .padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}`;
    } else {
      timestamp = `${minutes}:${remainingMinutes.toString().padStart(2, "0")}`;
    }

    const content = matchResult[2];
    return (
      <li className="mb-2 list-disc">
        <a
          href={`${encodeURI(`${baseUrl}/?t=${seconds}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-600"
        >
          {timestamp}
        </a>
        {`${content?.startsWith(":") ? content.substring(1) : content}`}
      </li>
    );
  }
  return <li className="mb-2 list-disc">{sentence}</li>;
}
