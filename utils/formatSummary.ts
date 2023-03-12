import { extractSentence } from "~/utils/extractSentence";
import { extractTimestamp } from "~/utils/extractTimestamp";

export function formatSummary(summary: string) {
  const summaryArray = ("\n" + summary).split("\n- ");
  const formattedSummary = summaryArray
    .map((s) => {
      const matchResult = extractSentence(s);
      if (matchResult) {
        const { formattedContent, timestamp } = extractTimestamp(matchResult);
        return timestamp + formattedContent;
      } else {
        return s.replace(/\n\n/g, "\n");
      }
    })
    .join("\n- ");
  return { summaryArray, formattedSummary };
}
