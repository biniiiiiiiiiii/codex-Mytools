const memoryStorage = new Map<string, string>()
const storageProbeKey = '__my-tools_storage_probe__'
const allowedRoutes = new Set(['/', '/formatter', '/validator'])

export const storageKeys = {
  formatterInput: 'my-tools:formatter-input',
  validatorInput: 'my-tools:validator-input',
  lastRoute: 'my-tools:last-route',
} as const

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const { localStorage } = window
    localStorage.setItem(storageProbeKey, '1')
    localStorage.removeItem(storageProbeKey)
    return localStorage
  } catch {
    return null
  }
}

export function isPersistentStorageAvailable() {
  return getLocalStorage() !== null
}

function readValue(key: string): string {
  const storage = getLocalStorage()

  if (storage) {
    try {
      return storage.getItem(key) ?? ''
    } catch {
      return memoryStorage.get(key) ?? ''
    }
  }

  return memoryStorage.get(key) ?? ''
}

function writeValue(key: string, value: string): boolean {
  const storage = getLocalStorage()

  if (!value) {
    return clearValue(key)
  }

  // Keep an in-memory mirror so the current session still works if persistence is blocked.
  memoryStorage.set(key, value)

  if (!storage) {
    return false
  }

  try {
    storage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

function clearValue(key: string): boolean {
  memoryStorage.delete(key)

  const storage = getLocalStorage()
  if (!storage) {
    return false
  }

  try {
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function loadFormatterInput() {
  return readValue(storageKeys.formatterInput)
}

export function saveFormatterInput(value: string) {
  return writeValue(storageKeys.formatterInput, value)
}

export function clearFormatterInput() {
  return clearValue(storageKeys.formatterInput)
}

export function loadValidatorInput() {
  return readValue(storageKeys.validatorInput)
}

export function saveValidatorInput(value: string) {
  return writeValue(storageKeys.validatorInput, value)
}

export function clearValidatorInput() {
  return clearValue(storageKeys.validatorInput)
}

export function loadLastRoute() {
  const route = readValue(storageKeys.lastRoute)
  return allowedRoutes.has(route) ? route : '/'
}

export function saveLastRoute(pathname: string) {
  if (!allowedRoutes.has(pathname)) {
    return false
  }

  return writeValue(storageKeys.lastRoute, pathname)
}

export function clearLastRoute() {
  return clearValue(storageKeys.lastRoute)
}
