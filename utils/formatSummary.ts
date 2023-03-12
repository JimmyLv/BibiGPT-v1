import { extractSentenceWithTimestamp } from "~/utils/extractSentenceWithTimestamp";
import { extractTimestamp } from "~/utils/extractTimestamp";

export function formatSummary(summary: string, shouldShowTimestamp?: boolean) {
  if (shouldShowTimestamp) {
    try {
      const parsedBulletPoints = JSON.parse(summary);
      const summaryArray = parsedBulletPoints.map(
        ({
          start_time,
          bullet_point,
        }: {
          start_time: number;
          bullet_point: string;
        }) => {
          const startTime = start_time === 0 ? "0.0" : start_time;
          return startTime + " " + bullet_point;
        }
      );
      return {
        summaryArray,
        formattedSummary: summaryArray.join("\n"),
      };
    } catch (e) {
      console.error(e);
      return {};
    }
  }

  const summaryArray = ("\n" + summary).split("\n- ");
  const formattedSummary = summaryArray
    .map((s) => {
      const matchTimestampResult = extractSentenceWithTimestamp(s);
      if (matchTimestampResult) {
        const { formattedContent, timestamp } =
          extractTimestamp(matchTimestampResult);
        return timestamp + formattedContent;
      } else {
        return s.replace(/\n\n/g, "\n");
      }
    })
    .join("\n- ");
  return { summaryArray, formattedSummary };
}
