import { limitTranscriptByteLength } from '~/lib/openai/getSmallSizeTranscripts'
import { VideoConfig } from '~/lib/types'
import { DEFAULT_LANGUAGE, PROMPT_LANGUAGE_MAP } from '~/utils/constants/language'

interface PromptConfig {
  language?: string
  sentenceCount?: string
  shouldShowTimestamp?: boolean
}

export function getExamplePrompt() {
  return {
    input: `标题: "【BiliGPT】AI 自动总结 B站 视频内容，GPT-3 智能提取并总结字幕"
视频字幕: "2.06 - 哈喽哈喽 这里是机密的频道 今天给大家整个活叫哔哩哔哩gp t  6.71 - 选择插着gp t的爆火 作为软件工程师的我也按捺不住 去需要把哔哩哔哩的url贴进来  21.04 - 然后你就点击一键总结 稍等片刻 你就可以获得这样一份精简的总结`,
    output: `视频概述：BiliGPT 是一款自动总结B站视频内容的 AI 工具

- 2.06 - 作为软件工程师的我按捺不住去开发了 BiliGPT
- 21.04 - 只需要粘贴哔哩哔哩的URL，一键总结为精简内容`,
  }
}

export function getSystemPrompt(promptConfig: PromptConfig) {
  // [gpt-3-youtube-summarizer/main.py at main · tfukaza/gpt-3-youtube-summarizer](https://github.com/tfukaza/gpt-3-youtube-summarizer/blob/main/main.py)
  console.log('prompt config: ', promptConfig)
  const { language = '中文', sentenceCount = '5', shouldShowTimestamp } = promptConfig
  // @ts-ignore
  const enLanguage = PROMPT_LANGUAGE_MAP[language]
  // 我希望你是一名专业的视频内容编辑，帮我用${language}总结视频的内容精华。请你将视频字幕文本进行总结（字幕中可能有错别字，如果你发现了错别字请改正），然后以无序列表的方式返回，不要超过5条。记得不要重复句子，确保所有的句子都足够精简，清晰完整，祝你好运！
  const betterPrompt = `I want you to act as an educational content creator. You will help students summarize the essence of the video in ${enLanguage}. Please summarize the video subtitles (there may be typos in the subtitles, please correct them) and return them in an unordered list format. Please do not exceed ${sentenceCount} items, and make sure not to repeat any sentences and all sentences are concise, clear, and complete. Good luck!`
  // const timestamp = ' ' //`（类似 10:24）`;
  // 我希望你是一名专业的视频内容编辑，帮我用${language}总结视频的内容精华。请先用一句简短的话总结视频梗概。然后再请你将视频字幕文本进行总结（字幕中可能有错别字，如果你发现了错别字请改正），在每句话的最前面加上时间戳${timestamp}，每句话开头只需要一个开始时间。请你以无序列表的方式返回，请注意不要超过5条哦，确保所有的句子都足够精简，清晰完整，祝你好运！
  const promptWithTimestamp = `I would like you to act as a professional video content editor. You will help students summarize the essence of the video in ${enLanguage}. Please start by summarizing the whole video in one short sentence (there may be typos in the subtitles, please correct them). Then, please summarize the video subtitles, each subtitle should has the start timestamp (e.g. 12.4 -) so that students can select the video part. Please return in an unordered list format, make sure not to exceed ${sentenceCount} items and all sentences are concise, clear, and complete. Good luck!`

  return shouldShowTimestamp ? promptWithTimestamp : betterPrompt
}
export function getUserSubtitlePrompt(title: string, transcript: any, videoConfig: VideoConfig) {
  const videoTitle = title?.replace(/\n+/g, ' ').trim()
  const videoTranscript = limitTranscriptByteLength(transcript).replace(/\n+/g, ' ').trim()
  const language = videoConfig.outputLanguage || DEFAULT_LANGUAGE
  const sentenceCount = videoConfig.sentenceNumber || 7
  const emojiTemplateText = videoConfig.showEmoji ? '[Emoji] ' : ''
  const emojiDescriptionText = videoConfig.showEmoji ? 'Choose an appropriate emoji for each bullet point. ' : ''
  const shouldShowAsOutline = Number(videoConfig.outlineLevel) > 1
  const wordsCount = videoConfig.detailLevel ? (Number(videoConfig.detailLevel) / 100) * 2 : 15
  const outlineTemplateText = shouldShowAsOutline ? `\n    - Child points` : ''
  const outlineDescriptionText = shouldShowAsOutline
    ? `Use the outline list, which can have a hierarchical structure of up to ${videoConfig.outlineLevel} levels. `
    : ''
  const prompt = `Your output should use the following template:\n## Summary\n## Highlights\n- ${emojiTemplateText}Bulletpoint${outlineTemplateText}\n\nYour task is to summarise the text I have given you in up to ${sentenceCount} concise bullet points, starting with a short highlight, each bullet point is at least ${wordsCount} words. ${outlineDescriptionText}${emojiDescriptionText}Use the text above: {{Title}} {{Transcript}}.\n\nReply in ${language} Language.`

  return `Title: "${videoTitle}"\nTranscript: "${videoTranscript}"\n\nInstructions: ${prompt}`
}

export function getUserSubtitleWithTimestampPrompt(title: string, transcript: any, videoConfig: VideoConfig) {
  const videoTitle = title?.replace(/\n+/g, ' ').trim()
  const videoTranscript = limitTranscriptByteLength(transcript).replace(/\n+/g, ' ').trim()
  const language = videoConfig.outputLanguage || DEFAULT_LANGUAGE
  const sentenceCount = videoConfig.sentenceNumber || 7
  const emojiTemplateText = videoConfig.showEmoji ? '[Emoji] ' : ''
  const wordsCount = videoConfig.detailLevel ? (Number(videoConfig.detailLevel) / 100) * 2 : 15
  const promptWithTimestamp = `Act as the author and provide exactly ${sentenceCount} bullet points for the text transcript given in the format [seconds] - [text] \nMake sure that:\n    - Please start by summarizing the whole video in one short sentence\n    - Then, please summarize with each bullet_point is at least ${wordsCount} words\n    - each bullet_point start with \"- \" or a number or a bullet point symbol\n    - each bullet_point should has the start timestamp, use this template: - seconds - ${emojiTemplateText}[bullet_point]\n    - there may be typos in the subtitles, please correct them\n    - Reply all in ${language} Language.`
  const videoTranscripts = limitTranscriptByteLength(JSON.stringify(videoTranscript))
  return `Title: ${videoTitle}\nTranscript: ${videoTranscripts}\n\nInstructions: ${promptWithTimestamp}`
}
