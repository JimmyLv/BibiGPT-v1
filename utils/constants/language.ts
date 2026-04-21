export const PROMPT_LANGUAGE_MAP: { [key: string]: string } = {
  English: 'en-US',
  中文: 'zh-CN',
  繁體中文: 'zh-TW',
  日本語: 'ja-JP',
  Italiano: 'it-IT',
  Deutsch: 'de-DE',
  Español: 'es-ES',
  Français: 'fr-FR',
  Nederlands: 'nl-NL',
  한국어: 'ko-KR',
  ភាសាខ្មែរ: 'km-KH',
  हिंदी: 'hi-IN',
}

// Maps locale codes to explicit English language names for use in AI prompts.
// Using explicit names (e.g. "Simplified Chinese") instead of locale codes (e.g. "zh-CN")
// reduces ambiguity and prevents the model from mixing up language variants.
export const LANGUAGE_CODE_TO_ENGLISH_NAME: { [key: string]: string } = {
  'en-US': 'English',
  'zh-CN': 'Simplified Chinese',
  'zh-TW': 'Traditional Chinese',
  'ja-JP': 'Japanese',
  'it-IT': 'Italian',
  'de-DE': 'German',
  'es-ES': 'Spanish',
  'fr-FR': 'French',
  'nl-NL': 'Dutch',
  'ko-KR': 'Korean',
  'km-KH': 'Khmer',
  'hi-IN': 'Hindi',
}

export const DEFAULT_LANGUAGE = 'zh-CN'
