const KEY = 'spaces:apiKey'
const ONBOARDED_KEY = 'spaces:onboarded'

export function loadApiKey() {
  return localStorage.getItem(KEY) || ''
}

export function saveApiKey(key) {
  if (key) localStorage.setItem(KEY, key)
  else localStorage.removeItem(KEY)
}

export function loadOnboarded() {
  return localStorage.getItem(ONBOARDED_KEY) === 'true'
}

export function saveOnboarded(value) {
  localStorage.setItem(ONBOARDED_KEY, value ? 'true' : 'false')
}
