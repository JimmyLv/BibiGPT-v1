export function trimOpenAiResult(result: any) {
  const answer = result.choices[0].message?.content || ''
  if (answer.startsWith('\n\n')) {
    return answer.substring(2)
  }
  return answer
}
