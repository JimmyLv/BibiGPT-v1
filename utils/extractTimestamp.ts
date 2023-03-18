export function extractTimestamp(matchResult: RegExpMatchArray) {
  let timestamp: string | undefined
  const seconds = Number(matchResult[1].replace(':', '.'))
  const hours = Math.floor(seconds / 3600)
  const remainingSeconds = Math.floor(seconds % 3600)
  const minutes = Math.floor(remainingSeconds / 60)
  const remainingMinutes = Math.floor(remainingSeconds % 60)
  if (hours > 0) {
    timestamp = `${hours}:${minutes.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`
  } else {
    timestamp = `${minutes}:${remainingMinutes.toString().padStart(2, '0')}`
  }

  const content = matchResult[2]
  let formattedContent = content
  try {
    formattedContent = content && /^[:：秒]/.test(content) ? content.substring(1) : content
    formattedContent = formattedContent && !/^ /.test(formattedContent) ? ' ' + formattedContent : formattedContent
  } catch (e) {
    console.error('handle text after time error', e)
  }
  // console.log("========matchResult========", {matchResult, timestamp, formattedContent});
  return { timestamp, formattedContent }
}

export function trimSeconds(secondsStr: number | string) {
  return Number(secondsStr).toFixed()
}
