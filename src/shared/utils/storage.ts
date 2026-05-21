const memoryStorage = new Map<string, string>()
const storageProbeKey = '__my-tools_storage_probe__'
const allowedRoutes = new Set(['/', '/formatter', '/validator', '/converter', '/sql-formatter'])

export const storageKeys = {
  formatterInput: 'my-tools:formatter-input',
  validatorInput: 'my-tools:validator-input',
  converterInput: 'my-tools:converter-input',
  converterRootClassName: 'my-tools:converter-root-class-name',
  converterNamespace: 'my-tools:converter-namespace',
  converterUseJsonPropertyName: 'my-tools:converter-use-json-property-name',
  converterDetectDateTime: 'my-tools:converter-detect-datetime',
  sqlFormatterInput: 'bin-tool-sql-formatter-input',
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

function readBoolean(key: string, fallback = false) {
  const value = readValue(key)
  if (!value) {
    return fallback
  }

  return value === 'true'
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

export function loadConverterInput() {
  return readValue(storageKeys.converterInput)
}

export function saveConverterInput(value: string) {
  return writeValue(storageKeys.converterInput, value)
}

export function clearConverterInput() {
  return clearValue(storageKeys.converterInput)
}

export function loadConverterRootClassName() {
  return readValue(storageKeys.converterRootClassName) || 'Root'
}

export function saveConverterRootClassName(value: string) {
  return writeValue(storageKeys.converterRootClassName, value)
}

export function clearConverterRootClassName() {
  return clearValue(storageKeys.converterRootClassName)
}

export function loadConverterNamespace() {
  return readValue(storageKeys.converterNamespace)
}

export function saveConverterNamespace(value: string) {
  return writeValue(storageKeys.converterNamespace, value)
}

export function clearConverterNamespace() {
  return clearValue(storageKeys.converterNamespace)
}

export function loadConverterUseJsonPropertyName() {
  return readBoolean(storageKeys.converterUseJsonPropertyName, false)
}

export function saveConverterUseJsonPropertyName(value: boolean) {
  return writeValue(storageKeys.converterUseJsonPropertyName, String(value))
}

export function clearConverterUseJsonPropertyName() {
  return clearValue(storageKeys.converterUseJsonPropertyName)
}

export function loadConverterDetectDateTime() {
  return readBoolean(storageKeys.converterDetectDateTime, false)
}

export function saveConverterDetectDateTime(value: boolean) {
  return writeValue(storageKeys.converterDetectDateTime, String(value))
}

export function clearConverterDetectDateTime() {
  return clearValue(storageKeys.converterDetectDateTime)
}

export function loadSqlFormatterInput() {
  return readValue(storageKeys.sqlFormatterInput)
}

export function saveSqlFormatterInput(value: string) {
  return writeValue(storageKeys.sqlFormatterInput, value)
}

export function clearSqlFormatterInput() {
  return clearValue(storageKeys.sqlFormatterInput)
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
