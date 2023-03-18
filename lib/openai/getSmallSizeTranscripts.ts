// Copyright (c) 2022 Kazuki Nakayashiki.
// Modified work: Copyright (c) 2023 Qixiang Zhu.
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// via https://github.com/lxfater/BilibiliSummary/blob/3d1a67cbe8e96adba60672b778ce89644a43280d/src/prompt.ts#L62
export function limitTranscriptByteLength(str: string, byteLimit: number = LIMIT_COUNT) {
  const utf8str = unescape(encodeURIComponent(str))
  const byteLength = utf8str.length
  if (byteLength > byteLimit) {
    const ratio = byteLimit / byteLength
    const newStr = str.substring(0, Math.floor(str.length * ratio))
    return newStr
  }
  return str
}
function filterHalfRandomly<T>(arr: T[]): T[] {
  const filteredArr: T[] = []
  const halfLength = Math.floor(arr.length / 2)
  const indicesToFilter = new Set<number>()

  // 随机生成要过滤掉的元素的下标
  while (indicesToFilter.size < halfLength) {
    const index = Math.floor(Math.random() * arr.length)
    if (!indicesToFilter.has(index)) {
      indicesToFilter.add(index)
    }
  }

  // 过滤掉要过滤的元素
  for (let i = 0; i < arr.length; i++) {
    if (!indicesToFilter.has(i)) {
      filteredArr.push(arr[i])
    }
  }

  return filteredArr
}
function getByteLength(text: string) {
  return unescape(encodeURIComponent(text)).length
}

function itemInIt(textData: SubtitleItem[], text: string): boolean {
  return textData.find((t) => t.text === text) !== undefined
}

type SubtitleItem = {
  text: string
  index: number
}

// Seems like 15,000 bytes is the limit for the prompt
// 13000 = 6500*2
const LIMIT_COUNT = 6200 // 2000 is a buffer
export function getSmallSizeTranscripts(
  newTextData: SubtitleItem[],
  oldTextData: SubtitleItem[],
  byteLimit: number = LIMIT_COUNT,
): string {
  const text = newTextData
    .sort((a, b) => a.index - b.index)
    .map((t) => t.text)
    .join(' ')
  const byteLength = getByteLength(text)

  if (byteLength > byteLimit) {
    const filtedData = filterHalfRandomly(newTextData)
    return getSmallSizeTranscripts(filtedData, oldTextData, byteLimit)
  }

  let resultData = newTextData.slice()
  let resultText = text
  let lastByteLength = byteLength

  for (let i = 0; i < oldTextData.length; i++) {
    const obj = oldTextData[i]
    if (itemInIt(newTextData, obj.text)) {
      continue
    }

    const nextTextByteLength = getByteLength(obj.text)
    const isOverLimit = lastByteLength + nextTextByteLength > byteLimit
    if (isOverLimit) {
      const overRate = (lastByteLength + nextTextByteLength - byteLimit) / nextTextByteLength
      const chunkedText = obj.text.substring(0, Math.floor(obj.text.length * overRate))
      resultData.push({ text: chunkedText, index: obj.index })
    } else {
      resultData.push(obj)
    }
    resultText = resultData
      .sort((a, b) => a.index - b.index)
      .map((t) => t.text)
      .join(' ')
    lastByteLength = getByteLength(resultText)
  }

  return resultText
}
