import { extractSentenceWithTimestamp } from "~/utils/extractSentenceWithTimestamp";
import { extractTimestamp } from "~/utils/extractTimestamp";

export function formatSummary(summary: string) {
/*
  if (shouldShowTimestamp) {
    try {
      const parsedBulletPoints = JSON.parse(summary);
      const summaryArray = parsedBulletPoints.map(
        ({ s, bullet_point }: { s: number; bullet_point: string }) => {
          const startTime = s === 0 ? "0.0" : s;
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
*/

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
