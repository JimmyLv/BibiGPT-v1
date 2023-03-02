export function extractTimestamp(matchResult: RegExpMatchArray) {
  console.log("========matchResult========", matchResult);
  let timestamp: string | undefined;
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
  const formattedContent = content?.startsWith(":")
    ? content.substring(1)
    : content;
  return { timestamp, formattedContent };
}
