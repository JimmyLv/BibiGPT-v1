import { limitTranscriptByteLength } from "~/lib/openai/getSmallSizeTranscripts";

interface PromptConfig {
  language?: string;
  sentenceCount?: string;
  shouldShowTimestamp?: boolean;
}
const PROMPT_LANGUAGE_MAP = {
  English: "UK English",
  中文: "Simplified Chinese",
  繁體中文: "Traditional Chinese",
  日本語: "Japanese",
  Italiano: "Italian",
  Deutsch: "German",
  Español: "Spanish",
  Français: "French",
  Nederlands: "Dutch",
  한국어: "Korean",
  ភាសាខ្មែរ: "Khmer",
  हिंदी: "Hindi",
};

export function getSystemPrompt(promptConfig: PromptConfig) {
  // [gpt-3-youtube-summarizer/main.py at main · tfukaza/gpt-3-youtube-summarizer](https://github.com/tfukaza/gpt-3-youtube-summarizer/blob/main/main.py)
  console.log("prompt config: ", promptConfig);
  const {
    language = "中文",
    sentenceCount = "5",
    shouldShowTimestamp,
  } = promptConfig;
  // @ts-ignore
  const enLanguage = PROMPT_LANGUAGE_MAP[language];
  // 我希望你是一名专业的视频内容编辑，帮我用${language}总结视频的内容精华。请你将视频字幕文本进行总结（字幕中可能有错别字，如果你发现了错别字请改正），然后以无序列表的方式返回，不要超过5条。记得不要重复句子，确保所有的句子都足够精简，清晰完整，祝你好运！
  const betterPrompt = `I want you to act as an educational content creator. You will help students summarize the essence of the video in ${enLanguage}. Please summarize the video subtitles (there may be typos in the subtitles, please correct them) and return them in an unordered list format. Please do not exceed ${sentenceCount} items, and make sure not to repeat any sentences and all sentences are concise, clear, and complete. Good luck!`;
  // const timestamp = ' ' //`（类似 10:24）`;
  // 我希望你是一名专业的视频内容编辑，帮我用${language}总结视频的内容精华。请先用一句简短的话总结视频梗概。然后再请你将视频字幕文本进行总结（字幕中可能有错别字，如果你发现了错别字请改正），在每句话的最前面加上时间戳${timestamp}，每句话开头只需要一个开始时间。请你以无序列表的方式返回，请注意不要超过5条哦，确保所有的句子都足够精简，清晰完整，祝你好运！
  const promptWithTimestamp = `I want you to act as an educational content creator. You will help students summarize the essence of the video in ${enLanguage}. Please start by summarizing the whole video in one short sentence. Then, please summarize the video subtitles in an unordered list format, you should add the start timestamp (e.g. 12.4 -) at the beginning of each sentence so that students can jump to the source of the video. Please make sure not to exceed ${sentenceCount} items and all sentences are concise, clear, and complete. Good luck!`;

  return shouldShowTimestamp ? promptWithTimestamp : betterPrompt;
}
export function getUserSubtitlePrompt(title: string, transcript: any) {
  return `标题: "${title
    ?.replace(/\n+/g, " ")
    .trim()}"\n视频字幕: "${limitTranscriptByteLength(transcript)
    .replace(/\n+/g, " ")
    .trim()}"`;
}
