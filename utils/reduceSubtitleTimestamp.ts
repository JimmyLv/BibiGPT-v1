import { CommonSubtitleItem } from "~/lib/types";

export type YoutubeSubtitleItem = { start: number; lines: string[] };

export function reduceSubtitleTimestamp(
  subtitles: Array<YoutubeSubtitleItem>
): Array<CommonSubtitleItem> {
  // 把字幕数组分成 10 组
  const groupCount = 20;
  const eachGroupCount =
    subtitles.length > groupCount
      ? subtitles.length / groupCount
      : subtitles.length;

  return subtitles.reduce(
    (
      accumulator: CommonSubtitleItem[],
      current: YoutubeSubtitleItem,
      index: number
    ) => {
      // 计算当前元素在哪一组
      const groupIndex: number = Math.floor(index / eachGroupCount);

      // 如果是当前组的第一个元素，初始化这一组的字符串
      if (!accumulator[groupIndex]) {
        accumulator[groupIndex] = {
          // 5.88 -> 5.9
          // text: current.start.toFixed() + ": ",
          text: current.start + ": ",
          index: groupIndex,
        };
      }

      // 将当前元素添加到当前组的字符串末尾
      accumulator[groupIndex].text =
        accumulator[groupIndex].text + current.lines.join(" ") + " ";

      return accumulator;
    },
    []
  );
}
