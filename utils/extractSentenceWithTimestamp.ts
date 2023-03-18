export function extractSentenceWithTimestamp(sentence: string) {
  return sentence
    .replace('0:', '0.0') // 修复第0秒
    .match(/^\s*(\d+[\.:]?\d+?)([:：秒 ].*)/)
}
