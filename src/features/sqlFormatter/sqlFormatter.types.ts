import type { KeywordCase, SqlLanguage } from 'sql-formatter'

export type SqlFormatterLanguage = Extract<SqlLanguage, 'mysql' | 'postgresql' | 'transactsql'>
export type SqlFormatterKeywordCase = KeywordCase
export type SqlFormatterTabWidth = 2 | 4
export type SqlFormatterLinesBetweenQueries = 1 | 2

export type SqlFormatterOptions = {
  language: SqlFormatterLanguage
  tabWidth: SqlFormatterTabWidth
  keywordCase: SqlFormatterKeywordCase
  linesBetweenQueries: SqlFormatterLinesBetweenQueries
}

export type SqlFormatterResult =
  | {
      ok: true
      output: string
    }
  | {
      ok: false
      error: string
    }
