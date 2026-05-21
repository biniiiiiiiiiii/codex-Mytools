import { format } from 'sql-formatter'
import type { SqlFormatterOptions, SqlFormatterResult } from './sqlFormatter.types'

export function formatSql(inputSql: string, options: SqlFormatterOptions): SqlFormatterResult {
  if (!inputSql.trim()) {
    return {
      ok: false,
      error: '请输入需要格式化的 SQL',
    }
  }

  try {
    return {
      ok: true,
      output: format(inputSql, {
        language: options.language,
        tabWidth: options.tabWidth,
        keywordCase: options.keywordCase,
        linesBetweenQueries: options.linesBetweenQueries,
      }),
    }
  } catch {
    return {
      ok: false,
      error: 'SQL 格式化失败，请检查 SQL 语法或切换正确的 SQL 方言',
    }
  }
}
