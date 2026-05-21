import { describe, expect, it } from 'vitest'
import { convertJsonToCSharp } from '../src/shared/utils/csharp'

describe('convertJsonToCSharp', () => {
  it('generates classes for nested objects', () => {
    const input = `{
      "user_name": "Tom",
      "profile": {
        "age": 18,
        "is_admin": true
      }
    }`

    const result = convertJsonToCSharp(input, {
      rootClassName: 'UserResponse',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.output).toContain('public class UserResponse')
      expect(result.output).toContain('public string UserName { get; set; }')
      expect(result.output).toContain('public Profile Profile { get; set; }')
      expect(result.output).toContain('public class Profile')
      expect(result.output).toContain('public int Age { get; set; }')
      expect(result.output).toContain('public bool IsAdmin { get; set; }')
    }
  })

  it('supports arrays and JsonPropertyName mapping', () => {
    const input = `{
      "items": [
        {
          "product_id": 1,
          "price": 12.5
        }
      ]
    }`

    const result = convertJsonToCSharp(input, {
      rootClassName: 'Catalog',
      useJsonPropertyName: true,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.output).toContain('using System.Collections.Generic;')
      expect(result.output).toContain('using System.Text.Json.Serialization;')
      expect(result.output).toContain('[JsonPropertyName("product_id")]')
      expect(result.output).toContain('public List<Item> Items { get; set; }')
      expect(result.output).toContain('public decimal Price { get; set; }')
    }
  })

  it('handles nullability and long inference', () => {
    const input = `{
      "name": null,
      "count": 2147483648,
      "tags": null
    }`

    const result = convertJsonToCSharp(input, {
      rootClassName: 'Metrics',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.output).toContain('public object? Name { get; set; }')
      expect(result.output).toContain('public long Count { get; set; }')
      expect(result.output).toContain('public object? Tags { get; set; }')
    }
  })

  it('detects DateTime only when enabled', () => {
    const input = `{
      "created_at": "2025-03-01T10:20:30Z"
    }`

    const disabled = convertJsonToCSharp(input, {
      rootClassName: 'AuditLog',
      useJsonPropertyName: true,
      detectDateTime: false,
    })

    const enabled = convertJsonToCSharp(input, {
      rootClassName: 'AuditLog',
      detectDateTime: true,
    })

    expect(disabled.ok).toBe(true)
    expect(enabled.ok).toBe(true)

    if (disabled.ok && enabled.ok) {
      expect(disabled.output).toContain('public string CreatedAt { get; set; }')
      expect(enabled.output).toContain('public DateTime CreatedAt { get; set; }')
    }
  })

  it('returns a structured error for invalid json', () => {
    const result = convertJsonToCSharp('{"name":"Tom",}', {
      rootClassName: 'Broken',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message.length).toBeGreaterThan(0)
      expect(result.error.hint).toBeTruthy()
    }
  })

  it('rejects primitive roots', () => {
    const result = convertJsonToCSharp('"plain text"', {
      rootClassName: 'PrimitiveRoot',
    })

    expect(result).toEqual({
      ok: false,
      error: {
        message: '根节点必须是 JSON 对象或对象数组。',
        hint: '请提供对象样本，或提供对象数组作为输入。',
      },
    })
  })
})
