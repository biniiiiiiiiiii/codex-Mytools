import { useMemo, useState } from 'react'
import { JsonEditor } from '../components/Editor/JsonEditor'
import { ResultPanel } from '../components/Panels/ResultPanel'
import { WorkspacePanel } from '../components/Panels/WorkspacePanel'
import { runFormatter } from '../features/formatter/formatter.service'
import { copyText } from '../shared/utils/clipboard'
import { SAMPLE_JSON } from '../shared/utils/sample'
import {
  clearFormatterInput,
  loadFormatterInput,
  saveFormatterInput,
} from '../shared/utils/storage'
import type { OperationStatus } from '../shared/types/common'

const idleStatus: OperationStatus = { tone: 'idle', message: '等待操作' }

export function FormatterPage() {
  const initialInput = loadFormatterInput()
  const [input, setInput] = useState(initialInput)
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState<OperationStatus>(idleStatus)
  const [saved, setSaved] = useState(Boolean(initialInput))

  const actions = useMemo(
    () => [
      {
        key: 'format',
        label: '格式化',
        onClick: () => {
          const result = runFormatter(input, 'format')
          if (!result.ok) {
            setOutput('')
            setStatus({ tone: 'error', message: result.error || 'JSON 格式不合法' })
            return
          }

          setOutput(result.output)
          setStatus({ tone: 'success', message: '格式化完成，可直接复制结果' })
        },
      },
      {
        key: 'minify',
        label: '压缩',
        variant: 'secondary' as const,
        onClick: () => {
          const result = runFormatter(input, 'minify')
          if (!result.ok) {
            setOutput('')
            setStatus({ tone: 'error', message: result.error || 'JSON 格式不合法' })
            return
          }

          setOutput(result.output)
          setStatus({ tone: 'success', message: '压缩完成，可直接复制结果' })
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
          setInput(SAMPLE_JSON)
          setOutput('')
          const persisted = saveFormatterInput(SAMPLE_JSON)
          setSaved(persisted)
          setStatus({
            tone: 'idle',
            message: persisted ? '已填充示例 JSON' : '已填充示例 JSON，本地持久化不可用',
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
          clearFormatterInput()
          setSaved(false)
          setStatus({ tone: 'idle', message: '输入、结果和本地缓存已清空' })
        },
      },
    ],
    [input, output],
  )

  const handleInputChange = (value: string) => {
    setInput(value)
    setOutput('')
    const persisted = saveFormatterInput(value)
    setSaved(Boolean(value) && persisted)
    setStatus({
      tone: 'idle',
      message: value
        ? persisted
          ? '输入已更新，等待处理'
          : '输入已更新，当前仅保留在本次会话中'
        : '等待操作',
    })
  }

  return (
    <div className="page">
      <section className="page__hero">
        <p className="page__eyebrow">Formatter</p>
        <h2 className="page__title">格式化 / 压缩</h2>
        <p className="page__description">把合法 JSON 美化为可读格式，或压缩成单行，所有处理都在浏览器本地完成。</p>
      </section>
      <WorkspacePanel
        actions={actions}
        input={
          <section className="panel">
            <div className="panel__header">
              <div>
                <h2 className="panel__title">输入 JSON</h2>
                <p className="panel__hint">支持粘贴、编辑、滚动与本地自动保存。</p>
              </div>
            </div>
            <JsonEditor value={input} onChange={handleInputChange} />
          </section>
        }
        result={
          <ResultPanel
            title="输出结果"
            description="仅在处理成功后展示结果，非法 JSON 不会生成伪结果。"
            value={output}
            tone={!output ? (status.tone === 'error' ? 'error' : 'default') : 'success'}
            emptyText="执行“格式化”或“压缩”后显示结果。"
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
