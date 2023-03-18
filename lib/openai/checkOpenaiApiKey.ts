export function checkOpenaiApiKey(str: string) {
  var pattern = /^sk-[A-Za-z0-9]{48}$/
  return pattern.test(str)
}

export function checkOpenaiApiKeys(str: string) {
  if (str.includes(',')) {
    const userApiKeys = str.split(',')
    return userApiKeys.every(checkOpenaiApiKey)
  }

  return checkOpenaiApiKey(str)
}
