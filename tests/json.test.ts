import { describe, expect, it } from 'vitest'
import { formatJson, minifyJson, validateJson } from '../src/shared/utils/json'

describe('formatJson', () => {
  it('formats valid json with two-space indentation', () => {
    const result = formatJson('{"name":"Tom","age":18}')

    expect(result).toEqual({
      ok: true,
      output: '{\n  "name": "Tom",\n  "age": 18\n}',
    })
  })

  it('returns a structured error for invalid json', () => {
    const result = formatJson('{"name":"Tom",}')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message.length).toBeGreaterThan(0)
      expect(result.error.hint).toBe('属性名必须使用双引号，或可能有尾随逗号。')
      expect(result.error.line).toBe(1)
      expect(result.error.column).toBeGreaterThan(1)
    }
  })
})

describe('minifyJson', () => {
  it('minifies valid json', () => {
    const result = minifyJson('{\n  "name": "Tom",\n  "age": 18\n}')

    expect(result).toEqual({
      ok: true,
      output: '{"name":"Tom","age":18}',
    })
  })

  it('returns a structured error for invalid json', () => {
    const result = minifyJson('{"name": "Tom" "age": 18}')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message.length).toBeGreaterThan(0)
      expect(result.error.hint).toContain('逗号')
    }
  })
})

describe('validateJson', () => {
  it('returns valid=true for legal json', () => {
    expect(validateJson('{"ok":true}')).toEqual({ valid: true })
  })

  it('returns line, column and friendly hint for invalid json', () => {
    const input = '{\n  "name": "Tom",\n  "age": 18,\n}'
    const result = validateJson(input)

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error.line).toBe(4)
      expect(result.error.column).toBe(1)
      expect(result.error.hint).toBeTruthy()
    }
  })
})
