import { extractSentenceWithTimestamp } from '~/utils/extractSentenceWithTimestamp'
import { extractTimestamp, trimSeconds } from '~/utils/extractTimestamp'

export default function videoIdSentence({
  videoId,
  videoUrl,
  sentence,
}: {
  videoId: string
  videoUrl: string
  sentence: string
}) {
  // https://youtube.com/watch?v=DHhOgWPKIKU&t=15s
  // https://youtu.be/DHhOgWPKIKU?t=246
  // https://www.bilibili.com/video/BV1fX4y1Q7Ux/?t=10

  const isBiliBili = videoUrl.includes('bilibili.com')
  // todo: if videoUrl is short-url (not bilibili.com or youtube.com)
  const baseUrl = isBiliBili
    ? `https://www.bilibili.com/video/${videoId}/?t=`
    : `https://youtube.com/watch?v=${videoId}&t=`

  const matchResult = extractSentenceWithTimestamp(sentence)
  if (matchResult) {
    // simplify the seconds with number: 1:11 or 1.11 -> 7, todo: 0.003 is not able
    const secondsStr = matchResult[1].split(':')[0]
    const seconds = trimSeconds(secondsStr)
    const { formattedContent, timestamp } = extractTimestamp(matchResult)

    return (
      <li className="mb-2 list-disc">
        <a
          href={`${encodeURI(baseUrl + seconds)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="z-10 text-sky-400 hover:text-sky-600"
        >
          {timestamp}
        </a>
        {`${formattedContent}`}
      </li>
    )
  }
  return <li className="mb-2 list-disc">{sentence}</li>
}
