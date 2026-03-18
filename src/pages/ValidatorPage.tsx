import { useMemo, useState } from 'react'
import { JsonEditor } from '../components/Editor/JsonEditor'
import { ResultPanel } from '../components/Panels/ResultPanel'
import { WorkspacePanel } from '../components/Panels/WorkspacePanel'
import { runValidation } from '../features/validator/validator.service'
import type { ValidationResult } from '../features/validator/validator.types'
import { SAMPLE_INVALID_JSON } from '../shared/utils/sample'
import {
  clearValidatorInput,
  loadValidatorInput,
  saveValidatorInput,
} from '../shared/utils/storage'
import type { OperationStatus } from '../shared/types/common'

const idleStatus: OperationStatus = { tone: 'idle', message: '等待校验' }

export function ValidatorPage() {
  const initialInput = loadValidatorInput()
  const [input, setInput] = useState(initialInput)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [status, setStatus] = useState<OperationStatus>(idleStatus)
  const [saved, setSaved] = useState(Boolean(initialInput))

  const actions = useMemo(
    () => [
      {
        key: 'validate',
        label: '校验',
        onClick: () => {
          const nextResult = runValidation(input)
          setResult(nextResult)
          setStatus({
            tone: nextResult.valid ? 'success' : 'error',
            message: nextResult.valid ? 'JSON 合法' : 'JSON 非法，请检查错误位置',
          })
        },
      },
      {
        key: 'sample',
        label: '示例数据',
        variant: 'ghost' as const,
        onClick: () => {
          setInput(SAMPLE_INVALID_JSON)
          setResult(null)
          const persisted = saveValidatorInput(SAMPLE_INVALID_JSON)
          setSaved(persisted)
          setStatus({
            tone: 'idle',
            message: persisted ? '已填充错误示例' : '已填充错误示例，本地持久化不可用',
          })
        },
      },
      {
        key: 'clear',
        label: '清空',
        variant: 'danger' as const,
        onClick: () => {
          setInput('')
          setResult(null)
          clearValidatorInput()
          setSaved(false)
          setStatus({ tone: 'idle', message: '输入、结果和本地缓存已清空' })
        },
      },
    ],
    [input],
  )

  const handleInputChange = (value: string) => {
    setInput(value)
    setResult(null)
    const persisted = saveValidatorInput(value)
    setSaved(Boolean(value) && persisted)
    setStatus({
      tone: 'idle',
      message: value
        ? persisted
          ? '输入已更新，等待校验'
          : '输入已更新，当前仅保留在本次会话中'
        : '等待校验',
    })
  }

  return (
    <div className="page">
      <section className="page__hero">
        <p className="page__eyebrow">Validator</p>
        <h2 className="page__title">JSON 校验</h2>
        <p className="page__description">检查 JSON 是否合法，并尽量给出错误位置与友好提示，帮助快速定位语法问题。</p>
      </section>
      <WorkspacePanel
        actions={actions}
        input={
          <section className="panel">
            <div className="panel__header">
              <div>
                <h2 className="panel__title">输入 JSON</h2>
                <p className="panel__hint">输入任意文本后，点击“校验”再解析。</p>
              </div>
            </div>
            <JsonEditor value={input} onChange={handleInputChange} />
          </section>
        }
        result={
          <ResultPanel
            title="校验结果"
            description="成功显示合法状态，失败显示错误摘要、位置与提示。"
            mode="text"
            tone={!result ? 'default' : result.valid ? 'success' : 'error'}
            emptyText="执行“校验”后显示结果。"
          >
            {result ? (
              <div className="validator-card">
                <h3
                  className={
                    result.valid
                      ? 'validator-card__headline validator-card__headline--success'
                      : 'validator-card__headline validator-card__headline--error'
                  }
                >
                  {result.valid ? 'JSON 合法' : 'JSON 非法'}
                </h3>
                <div className="validator-card__summary">{result.summary}</div>
                {typeof result.line === 'number' && typeof result.column === 'number' ? (
                  <div className="validator-card__meta">
                    位置：第 {result.line} 行，第 {result.column} 列
                  </div>
                ) : null}
                {result.hint ? <div className="validator-card__meta">提示：{result.hint}</div> : null}
                {result.valid ? (
                  <div className="validator-card__meta">可继续用于格式化、压缩或复制。</div>
                ) : null}
              </div>
            ) : undefined}
          </ResultPanel>
        }
        status={status}
        saved={saved}
        inputLength={input.length}
      />
    </div>
  )
}
