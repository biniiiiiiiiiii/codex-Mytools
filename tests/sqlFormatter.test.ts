import { describe, expect, it } from 'vitest'
import { formatSql } from '../src/features/sqlFormatter/sqlFormatter.service'

const sampleSql =
  "select u.id,u.name,o.order_no,o.amount from users u left join orders o on u.id=o.user_id where u.status='active' and o.created_at>='2026-01-01' order by o.created_at desc;"

describe('formatSql', () => {
  it('formats mysql sql with readable line breaks', () => {
    const result = formatSql(sampleSql, {
      language: 'mysql',
      tabWidth: 2,
      keywordCase: 'upper',
      linesBetweenQueries: 1,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.output).toContain('SELECT')
      expect(result.output).toContain('\nFROM\n  users u')
      expect(result.output).toContain('\n  LEFT JOIN orders o')
      expect(result.output).toContain('\nORDER BY')
    }
  })

  it('supports lower-case keywords and four-space indentation', () => {
    const result = formatSql('select id from users where status = 1', {
      language: 'mysql',
      tabWidth: 4,
      keywordCase: 'lower',
      linesBetweenQueries: 1,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.output).toContain('select')
      expect(result.output).toContain('\nfrom\n    users')
      expect(result.output).not.toContain('SELECT')
    }
  })

  it('returns a friendly error for empty input', () => {
    const result = formatSql('   ', {
      language: 'mysql',
      tabWidth: 2,
      keywordCase: 'preserve',
      linesBetweenQueries: 1,
    })

    expect(result).toEqual({
      ok: false,
      error: '请输入需要格式化的 SQL',
    })
  })
})
