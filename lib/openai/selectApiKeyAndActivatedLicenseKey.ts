import { activateLicenseKey } from '~/lib/lemon'
import { checkOpenaiApiKeys } from '~/lib/openai/checkOpenaiApiKey'
import { sample } from '~/utils/fp'

export async function selectApiKeyAndActivatedLicenseKey(apiKey?: string, videoId?: string) {
  if (apiKey) {
    if (checkOpenaiApiKeys(apiKey)) {
      const userApiKeys = apiKey.split(',')
      return sample(userApiKeys)
    }

    // user is using validated licenseKey
    const activated = await activateLicenseKey(apiKey, videoId)
    if (!activated) {
      throw new Error('licenseKey is not validated!')
    }
  }

  // don't need to validate anymore, already verified in middleware?
  const myApiKeyList = process.env.OPENAI_API_KEY
  const luckyApiKey = sample(myApiKeyList?.split(','))
  return luckyApiKey || ''
}
