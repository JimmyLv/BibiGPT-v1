/**
 * Strip MiniMax reasoning model `<think>…</think>` blocks that leak into the
 * visible output.  Returns the cleaned text.
 */
export function stripThinkingTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
}

export function trimOpenAiResult(result: any) {
  const answer = typeof result === 'string' ? result : result?.choices?.[0]?.message?.content || ''
  const cleaned = stripThinkingTags(answer)
  if (cleaned.startsWith('\n\n')) {
    return cleaned.substring(2)
  }
  return cleaned
}
