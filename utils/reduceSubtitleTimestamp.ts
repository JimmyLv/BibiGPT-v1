import { CommonSubtitleItem } from '~/lib/types'

export type YoutubeSubtitleItem = { start: number; lines: string[] }
/*{ "from": 16.669, "content": "让ppt变得更加精彩" },*/
export type BilibiliSubtitleItem = { from: number; content: string }

export function reduceYoutubeSubtitleTimestamp(subtitles: Array<YoutubeSubtitleItem> = []) {
  return reduceSubtitleTimestamp<YoutubeSubtitleItem>(
    subtitles,
    (i) => i.start,
    (i) => i.lines.join(' '),
    true,
  )
}

export function reduceBilibiliSubtitleTimestamp(
  subtitles: Array<BilibiliSubtitleItem> = [],
  shouldShowTimestamp?: boolean,
): Array<CommonSubtitleItem> {
  return reduceSubtitleTimestamp<BilibiliSubtitleItem>(
    subtitles,
    (i) => i.from,
    (i) => i.content,
    shouldShowTimestamp,
  )
}
export function reduceSubtitleTimestamp<T>(
  subtitles: Array<T> = [],
  getStart: (i: T) => number,
  getText: (i: T) => string,
  shouldShowTimestamp?: boolean,
): Array<CommonSubtitleItem> {
  // 把字幕数组总共分成 20 组
  const TOTAL_GROUP_COUNT = 30
  // 如果字幕不够多，就每7句话合并一下
  const MINIMUM_COUNT_ONE_GROUP = 7
  const eachGroupCount =
    subtitles.length > TOTAL_GROUP_COUNT ? subtitles.length / TOTAL_GROUP_COUNT : MINIMUM_COUNT_ONE_GROUP

  return subtitles.reduce((accumulator: CommonSubtitleItem[], current: T, index: number) => {
    // 计算当前元素在哪一组
    const groupIndex: number = Math.floor(index / MINIMUM_COUNT_ONE_GROUP)

    // 如果是当前组的第一个元素，初始化这一组的字符串
    if (!accumulator[groupIndex]) {
      accumulator[groupIndex] = {
        // 5.88 -> 5.9
        // text: current.start.toFixed() + ": ",
        index: groupIndex,
        s: getStart(current),
        text: shouldShowTimestamp ? getStart(current) + ' - ' : '',
      }
    }

    // 将当前元素添加到当前组的字符串末尾
    accumulator[groupIndex].text = accumulator[groupIndex].text + getText(current) + ' '

    return accumulator
  }, [])
}
