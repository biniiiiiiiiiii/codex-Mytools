import { useMemo, useState } from 'react'
import { JsonEditor } from '../components/Editor/JsonEditor'
import { ResultPanel } from '../components/Panels/ResultPanel'
import { WorkspacePanel } from '../components/Panels/WorkspacePanel'
import { formatSql } from '../features/sqlFormatter/sqlFormatter.service'
import type {
  SqlFormatterKeywordCase,
  SqlFormatterLanguage,
  SqlFormatterLinesBetweenQueries,
  SqlFormatterTabWidth,
} from '../features/sqlFormatter/sqlFormatter.types'
import type { OperationStatus } from '../shared/types/common'
import { copyText } from '../shared/utils/clipboard'
import { SAMPLE_SQL } from '../shared/utils/sample'
import {
  clearSqlFormatterInput,
  loadSqlFormatterInput,
  saveSqlFormatterInput,
} from '../shared/utils/storage'

const idleStatus: OperationStatus = { tone: 'idle', message: '等待格式化' }

const languageOptions: Array<{ label: string; value: SqlFormatterLanguage }> = [
  { label: 'MySQL', value: 'mysql' },
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'SQL Server / T-SQL', value: 'transactsql' },
]

const keywordCaseOptions: Array<{ label: string; value: SqlFormatterKeywordCase }> = [
  { label: '保持默认', value: 'preserve' },
  { label: '大写', value: 'upper' },
  { label: '小写', value: 'lower' },
]

const tabWidthOptions: SqlFormatterTabWidth[] = [2, 4]
const linesBetweenQueriesOptions: SqlFormatterLinesBetweenQueries[] = [1, 2]

export function SqlFormatterPage() {
  const initialInput = loadSqlFormatterInput()
  const [input, setInput] = useState(initialInput)
  const [output, setOutput] = useState('')
  const [language, setLanguage] = useState<SqlFormatterLanguage>('mysql')
  const [keywordCase, setKeywordCase] = useState<SqlFormatterKeywordCase>('preserve')
  const [tabWidth, setTabWidth] = useState<SqlFormatterTabWidth>(2)
  const [linesBetweenQueries, setLinesBetweenQueries] =
    useState<SqlFormatterLinesBetweenQueries>(1)
  const [status, setStatus] = useState<OperationStatus>(idleStatus)
  const [saved, setSaved] = useState(Boolean(initialInput))

  const actions = useMemo(
    () => [
      {
        key: 'format',
        label: '格式化',
        onClick: () => {
          const result = formatSql(input, {
            language,
            tabWidth,
            keywordCase,
            linesBetweenQueries,
          })

          if (!result.ok) {
            setStatus({ tone: 'error', message: result.error })
            return
          }

          setOutput(result.output)
          setStatus({ tone: 'success', message: 'SQL 格式化完成，可直接复制结果' })
        },
      },
      {
        key: 'copy',
        label: '复制结果',
        variant: 'ghost' as const,
        disabled: !output,
        onClick: async () => {
          if (!output) return
          const success = await copyText(output)
          setStatus({
            tone: success ? 'success' : 'error',
            message: success ? '结果已复制到剪贴板' : '复制失败，请检查浏览器权限',
          })
        },
      },
      {
        key: 'sample',
        label: '示例数据',
        variant: 'ghost' as const,
        onClick: () => {
          setInput(SAMPLE_SQL)
          setOutput('')
          const persisted = saveSqlFormatterInput(SAMPLE_SQL)
          setSaved(persisted)
          setStatus({
            tone: 'idle',
            message: persisted ? '已填充示例 SQL' : '已填充示例 SQL，当前仅保留在本次会话中',
          })
        },
      },
      {
        key: 'clear',
        label: '清空',
        variant: 'danger' as const,
        onClick: () => {
          setInput('')
          setOutput('')
          clearSqlFormatterInput()
          setSaved(false)
          setStatus({ tone: 'idle', message: '输入、结果和提示已清空' })
        },
      },
    ],
    [input, keywordCase, language, linesBetweenQueries, output, tabWidth],
  )

  const handleInputChange = (value: string) => {
    setInput(value)
    const persisted = saveSqlFormatterInput(value)
    setSaved(Boolean(value) && persisted)
    setStatus({
      tone: 'idle',
      message: value
        ? persisted
          ? '输入已更新，等待格式化'
          : '输入已更新，当前仅保留在本次会话中'
        : '等待格式化',
    })
  }

  const handleLanguageChange = (value: SqlFormatterLanguage) => {
    setLanguage(value)
    setStatus({
      tone: 'idle',
      message:
        value === 'transactsql'
          ? '已切换到 SQL Server / T-SQL 方言'
          : 'SQL 方言已更新，等待格式化',
    })
  }

  const handleKeywordCaseChange = (value: SqlFormatterKeywordCase) => {
    setKeywordCase(value)
    setStatus({ tone: 'idle', message: '关键字大小写配置已更新' })
  }

  const handleTabWidthChange = (value: SqlFormatterTabWidth) => {
    setTabWidth(value)
    setStatus({ tone: 'idle', message: '缩进宽度配置已更新' })
  }

  const handleLinesBetweenQueriesChange = (value: SqlFormatterLinesBetweenQueries) => {
    setLinesBetweenQueries(value)
    setStatus({ tone: 'idle', message: '多条 SQL 之间空行数已更新' })
  }

  return (
    <div className="page">
      <section className="page__hero">
        <p className="page__eyebrow">SQL 阅读</p>
        <h2 className="page__title">SQL 格式化</h2>
        <p className="page__description">
          把 SQL 美化为更易读的格式，支持多种常见数据库方言，所有处理都在浏览器本地完成。
        </p>
      </section>
      <WorkspacePanel
        actions={actions}
        input={
          <section className="panel">
            <div className="panel__header">
              <div>
                <h2 className="panel__title">输入 SQL</h2>
                <p className="panel__hint">
                  sql-formatter 对复杂存储过程支持有限；SQL Server 方括号语法请使用 T-SQL 方言。
                </p>
              </div>
            </div>
            <div className="converter-form">
              <label className="field">
                <span className="field__label">SQL 方言</span>
                <select
                  className="field__input"
                  value={language}
                  onChange={(event) =>
                    handleLanguageChange(event.target.value as SqlFormatterLanguage)
                  }
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field__label">关键字大小写</span>
                <select
                  className="field__input"
                  value={keywordCase}
                  onChange={(event) =>
                    handleKeywordCaseChange(event.target.value as SqlFormatterKeywordCase)
                  }
                >
                  {keywordCaseOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field__label">缩进宽度</span>
                <select
                  className="field__input"
                  value={tabWidth}
                  onChange={(event) =>
                    handleTabWidthChange(Number(event.target.value) as SqlFormatterTabWidth)
                  }
                >
                  {tabWidthOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field__label">多条 SQL 空行数</span>
                <select
                  className="field__input"
                  value={linesBetweenQueries}
                  onChange={(event) =>
                    handleLinesBetweenQueriesChange(
                      Number(event.target.value) as SqlFormatterLinesBetweenQueries,
                    )
                  }
                >
                  {linesBetweenQueriesOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <JsonEditor value={input} onChange={handleInputChange} language="sql" />
          </section>
        }
        result={
          <ResultPanel
            title="输出结果"
            description="仅展示格式化结果，不执行 SQL、不连接数据库、不做安全检查。"
            value={output}
            language="sql"
            tone={!output ? (status.tone === 'error' ? 'error' : 'default') : 'success'}
            emptyText="执行“格式化”后显示结果。"
          />
        }
        status={status}
        saved={saved}
        inputLength={input.length}
        outputLength={output.length}
      />
    </div>
  )
}
