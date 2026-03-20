import { describe, it, expect } from 'vitest'
import {
  PROVIDER_PRESETS,
  getProviderPreset,
  detectProviderFromUrl,
} from '~/lib/providers/presets'

describe('PROVIDER_PRESETS', () => {
  it('should include OpenAI and MiniMax presets', () => {
    const ids = PROVIDER_PRESETS.map((p) => p.id)
    expect(ids).toContain('openai')
    expect(ids).toContain('minimax')
  })

  it('each preset should have required fields', () => {
    for (const preset of PROVIDER_PRESETS) {
      expect(preset.id).toBeTruthy()
      expect(preset.label).toBeTruthy()
      expect(preset.baseUrl).toMatch(/^https:\/\//)
      expect(preset.apiKeyEnv).toBeTruthy()
      expect(preset.models.length).toBeGreaterThan(0)
      expect(preset.defaultModel).toBeTruthy()
    }
  })

  it('MiniMax preset should have correct base URL', () => {
    const minimax = PROVIDER_PRESETS.find((p) => p.id === 'minimax')!
    expect(minimax.baseUrl).toBe('https://api.minimax.io/v1')
  })

  it('MiniMax preset should list M2.7 and M2.5-highspeed models', () => {
    const minimax = PROVIDER_PRESETS.find((p) => p.id === 'minimax')!
    const modelIds = minimax.models.map((m) => m.id)
    expect(modelIds).toContain('MiniMax-M2.7')
    expect(modelIds).toContain('MiniMax-M2.5-highspeed')
  })

  it('MiniMax preset should default to M2.7', () => {
    const minimax = PROVIDER_PRESETS.find((p) => p.id === 'minimax')!
    expect(minimax.defaultModel).toBe('MiniMax-M2.7')
  })

  it('MiniMax preset should use MINIMAX_API_KEY env var', () => {
    const minimax = PROVIDER_PRESETS.find((p) => p.id === 'minimax')!
    expect(minimax.apiKeyEnv).toBe('MINIMAX_API_KEY')
  })

  it('OpenAI preset should have correct base URL', () => {
    const openai = PROVIDER_PRESETS.find((p) => p.id === 'openai')!
    expect(openai.baseUrl).toBe('https://api.openai.com/v1')
  })

  it('preset base URLs should not have trailing slashes', () => {
    for (const preset of PROVIDER_PRESETS) {
      expect(preset.baseUrl).not.toMatch(/\/$/)
    }
  })

  it('preset default models should be in the models list', () => {
    for (const preset of PROVIDER_PRESETS) {
      const modelIds = preset.models.map((m) => m.id)
      expect(modelIds).toContain(preset.defaultModel)
    }
  })
})

describe('getProviderPreset', () => {
  it('should return preset for known ids', () => {
    expect(getProviderPreset('openai')?.id).toBe('openai')
    expect(getProviderPreset('minimax')?.id).toBe('minimax')
  })

  it('should return undefined for unknown ids', () => {
    expect(getProviderPreset('nonexistent')).toBeUndefined()
    expect(getProviderPreset('')).toBeUndefined()
  })
})

describe('detectProviderFromUrl', () => {
  it('should detect OpenAI from URL', () => {
    expect(detectProviderFromUrl('https://api.openai.com/v1')).toBe('openai')
    expect(detectProviderFromUrl('https://api.openai.com/v1/')).toBe('openai')
  })

  it('should detect MiniMax from URL', () => {
    expect(detectProviderFromUrl('https://api.minimax.io/v1')).toBe('minimax')
    expect(detectProviderFromUrl('https://api.minimax.io/v1/')).toBe('minimax')
  })

  it('should return "custom" for unknown URLs', () => {
    expect(detectProviderFromUrl('https://my-custom-api.example.com/v1')).toBe('custom')
  })

  it('should return "openai" for undefined/empty URLs', () => {
    expect(detectProviderFromUrl(undefined)).toBe('openai')
    expect(detectProviderFromUrl('')).toBe('openai')
  })

  it('should be case-insensitive', () => {
    expect(detectProviderFromUrl('https://API.MINIMAX.IO/v1')).toBe('minimax')
    expect(detectProviderFromUrl('https://API.OPENAI.COM/V1')).toBe('openai')
  })
})
