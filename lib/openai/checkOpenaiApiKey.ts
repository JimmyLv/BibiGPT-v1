function getCompatibleKeyPrefixes() {
  return (process.env.OPENAI_COMPATIBLE_KEY_PREFIXES || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function checkOpenaiApiKey(str: string) {
  const key = str.trim()
  if (!key || key.includes(' ')) {
    return false
  }

  // Covers classic `sk-...` and project-scoped `sk-proj-...` keys.
  const openAiKeyPattern = /^(sk|sk-proj)-[A-Za-z0-9_-]{20,}$/
  if (openAiKeyPattern.test(key)) {
    return true
  }

  // For OpenAI-compatible providers, allow additional key prefixes from env.
  return getCompatibleKeyPrefixes().some((prefix) => key.startsWith(prefix))
}

export function checkOpenaiApiKeys(str: string) {
  if (str.includes(',')) {
    const userApiKeys = str.split(',').map((item) => item.trim())
    return userApiKeys.every(checkOpenaiApiKey)
  }

  return checkOpenaiApiKey(str)
}
