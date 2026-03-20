/**
 * Provider presets for quick configuration of LLM backends.
 *
 * Each preset bundles the base URL, API-key env var name, and a curated list
 * of recommended models so the user can switch providers in one click.
 */

export type ProviderModel = {
  id: string
  name: string
}

export type ProviderPreset = {
  /** Machine-readable identifier used as the select-option value. */
  id: string
  /** Human-readable label shown in the UI. */
  label: string
  /** Base URL of the OpenAI-compatible endpoint (without trailing slash). */
  baseUrl: string
  /** Name of the env var that holds the API key for this provider. */
  apiKeyEnv: string
  /** Curated list of models to show when this provider is selected. */
  models: ProviderModel[]
  /** Default model id to use when none is explicitly selected. */
  defaultModel: string
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    apiKeyEnv: 'OPENAI_API_KEY',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ],
    defaultModel: 'gpt-4o-mini',
  },
  {
    id: 'minimax',
    label: 'MiniMax',
    baseUrl: 'https://api.minimax.io/v1',
    apiKeyEnv: 'MINIMAX_API_KEY',
    models: [
      { id: 'MiniMax-M2.7', name: 'MiniMax M2.7' },
      { id: 'MiniMax-M2.5-highspeed', name: 'MiniMax M2.5 Highspeed (204K)' },
    ],
    defaultModel: 'MiniMax-M2.7',
  },
]

/**
 * Look up a provider preset by its `id`.  Returns `undefined` when the id
 * does not match any known preset (e.g. when the user types a custom URL).
 */
export function getProviderPreset(id: string): ProviderPreset | undefined {
  return PROVIDER_PRESETS.find((p) => p.id === id)
}

/**
 * Detect which provider preset matches the given base URL.
 * Returns the preset id, or `'custom'` when no preset matches.
 */
export function detectProviderFromUrl(baseUrl: string | undefined): string {
  if (!baseUrl) return 'openai'
  const normalised = baseUrl.replace(/\/+$/, '').toLowerCase()
  for (const preset of PROVIDER_PRESETS) {
    if (normalised === preset.baseUrl.toLowerCase()) {
      return preset.id
    }
  }
  return 'custom'
}
