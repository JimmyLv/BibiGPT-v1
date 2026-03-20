import { describe, it, expect } from 'vitest'
import { trimOpenAiResult, stripThinkingTags } from '~/lib/openai/trimOpenAiResult'

describe('stripThinkingTags', () => {
  it('should strip single thinking block', () => {
    const input = '<think>reasoning here</think>The actual answer.'
    expect(stripThinkingTags(input)).toBe('The actual answer.')
  })

  it('should strip multiple thinking blocks', () => {
    const input = '<think>first</think>Part 1<think>second</think>Part 2'
    expect(stripThinkingTags(input)).toBe('Part 1Part 2')
  })

  it('should handle multiline thinking blocks', () => {
    const input = '<think>\nStep 1: analyze\nStep 2: summarize\n</think>\nHere is the summary.'
    expect(stripThinkingTags(input)).toBe('Here is the summary.')
  })

  it('should return text unchanged when no thinking tags present', () => {
    const input = 'Just a normal response without thinking tags.'
    expect(stripThinkingTags(input)).toBe(input)
  })

  it('should handle empty string', () => {
    expect(stripThinkingTags('')).toBe('')
  })

  it('should handle text that is only thinking tags', () => {
    const input = '<think>only reasoning, no answer</think>'
    expect(stripThinkingTags(input)).toBe('')
  })
})

describe('trimOpenAiResult', () => {
  it('should trim leading double newlines', () => {
    expect(trimOpenAiResult('\n\nHello')).toBe('Hello')
  })

  it('should handle string result', () => {
    expect(trimOpenAiResult('A summary')).toBe('A summary')
  })

  it('should extract from OpenAI response object', () => {
    const result = { choices: [{ message: { content: 'Summary content' } }] }
    expect(trimOpenAiResult(result)).toBe('Summary content')
  })

  it('should handle empty/undefined results', () => {
    expect(trimOpenAiResult(undefined)).toBe('')
    expect(trimOpenAiResult(null)).toBe('')
    expect(trimOpenAiResult({})).toBe('')
  })

  it('should strip thinking tags from MiniMax reasoning models', () => {
    const input = '<think>Let me analyze this video...</think>\n\nHere are the key points:'
    expect(trimOpenAiResult(input)).toBe('Here are the key points:')
  })

  it('should strip thinking tags from response object', () => {
    const result = {
      choices: [{ message: { content: '<think>reasoning</think>The answer' } }],
    }
    expect(trimOpenAiResult(result)).toBe('The answer')
  })
})
