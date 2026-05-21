import { useMemo, useState } from 'react'
import { JsonEditor } from '../components/Editor/JsonEditor'
import { ResultPanel } from '../components/Panels/ResultPanel'
import { WorkspacePanel } from '../components/Panels/WorkspacePanel'
import { runConverter } from '../features/converter/converter.service'
import { copyText } from '../shared/utils/clipboard'
import { SAMPLE_CSHARP_JSON } from '../shared/utils/sample'
import {
  clearConverterDetectDateTime,
  clearConverterInput,
  clearConverterNamespace,
  clearConverterRootClassName,
  clearConverterUseJsonPropertyName,
  loadConverterDetectDateTime,
  loadConverterInput,
  loadConverterNamespace,
  loadConverterRootClassName,
  loadConverterUseJsonPropertyName,
  saveConverterDetectDateTime,
  saveConverterInput,
  saveConverterNamespace,
  saveConverterRootClassName,
  saveConverterUseJsonPropertyName,
} from '../shared/utils/storage'
import type { OperationStatus } from '../shared/types/common'

const idleStatus: OperationStatus = { tone: 'idle', message: '等待生成' }

export function ConverterPage() {
  const initialInput = loadConverterInput()
  const initialRootClassName = loadConverterRootClassName()
  const initialNamespace = loadConverterNamespace()
  const initialUseJsonPropertyName = loadConverterUseJsonPropertyName()
  const initialDetectDateTime = loadConverterDetectDateTime()

  const [input, setInput] = useState(initialInput)
  const [output, setOutput] = useState('')
  const [rootClassName, setRootClassName] = useState(initialRootClassName)
  const [namespaceValue, setNamespaceValue] = useState(initialNamespace)
  const [useJsonPropertyName, setUseJsonPropertyName] = useState(initialUseJsonPropertyName)
  const [detectDateTime, setDetectDateTime] = useState(initialDetectDateTime)
  const [status, setStatus] = useState<OperationStatus>(idleStatus)
  const [saved, setSaved] = useState(Boolean(initialInput))

  const actions = useMemo(
    () => [
      {
        key: 'generate',
        label: '生成',
        onClick: () => {
          const result = runConverter(input, {
            rootClassName,
            namespace: namespaceValue,
            useJsonPropertyName,
            detectDateTime,
          })

          if (!result.ok) {
            setOutput('')
            const position =
              typeof result.line === 'number' && typeof result.column === 'number'
                ? `（第 ${result.line} 行，第 ${result.column} 列）`
                : ''
            setStatus({
              tone: 'error',
              message: `${result.error}${position}`,
            })
            return
          }

          setOutput(result.output)
          setStatus({ tone: 'success', message: 'C# Class 已生成，可直接复制结果' })
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
            message: success ? 'C# 代码已复制到剪贴板' : '复制失败，请检查浏览器权限',
          })
        },
      },
      {
        key: 'sample',
        label: '示例数据',
        variant: 'ghost' as const,
        onClick: () => {
          setInput(SAMPLE_CSHARP_JSON)
          setRootClassName('UserResponse')
          setNamespaceValue('MyTools.Generated')
          setUseJsonPropertyName(true)
          setDetectDateTime(false)
          setOutput('')

          const persistFlags = [
            saveConverterInput(SAMPLE_CSHARP_JSON),
            saveConverterRootClassName('UserResponse'),
            saveConverterNamespace('MyTools.Generated'),
            saveConverterUseJsonPropertyName(true),
            saveConverterDetectDateTime(false),
          ]

          setSaved(persistFlags.every(Boolean))
          setStatus({
            tone: 'idle',
            message: persistFlags.every(Boolean)
              ? '已填充转换示例'
              : '已填充转换示例，当前仅保留在本次会话中',
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
          setRootClassName('Root')
          setNamespaceValue('')
          setUseJsonPropertyName(false)
          setDetectDateTime(false)
          clearConverterInput()
          clearConverterRootClassName()
          clearConverterNamespace()
          clearConverterUseJsonPropertyName()
          clearConverterDetectDateTime()
          setSaved(false)
          setStatus({ tone: 'idle', message: '输入、配置、结果和本地缓存已清空' })
        },
      },
    ],
    [detectDateTime, input, namespaceValue, output, rootClassName, useJsonPropertyName],
  )

  const updateSaved = (persisted: boolean, hasValue = true) => {
    setSaved(hasValue && persisted)
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    setOutput('')
    const persisted = saveConverterInput(value)
    updateSaved(persisted, Boolean(value))
    setStatus({
      tone: 'idle',
      message: value
        ? persisted
          ? '输入已更新，等待生成'
          : '输入已更新，当前仅保留在本次会话中'
        : '等待生成',
    })
  }

  const handleRootClassNameChange = (value: string) => {
    setRootClassName(value)
    setOutput('')
    const persisted = saveConverterRootClassName(value)
    updateSaved(persisted, Boolean(input))
  }

  const handleNamespaceChange = (value: string) => {
    setNamespaceValue(value)
    setOutput('')
    const persisted = saveConverterNamespace(value)
    updateSaved(persisted, Boolean(input))
  }

  const handleUseJsonPropertyNameChange = (value: boolean) => {
    setUseJsonPropertyName(value)
    setOutput('')
    const persisted = saveConverterUseJsonPropertyName(value)
    updateSaved(persisted, Boolean(input))
  }

  const handleDetectDateTimeChange = (value: boolean) => {
    setDetectDateTime(value)
    setOutput('')
    const persisted = saveConverterDetectDateTime(value)
    updateSaved(persisted, Boolean(input))
  }

  return (
    <div className="page">
      <section className="page__hero">
        <p className="page__eyebrow">Converter</p>
        <h2 className="page__title">JSON 转 C# Class</h2>
        <p className="page__description">
          根据 JSON 样本在浏览器本地生成 C# class，支持根类名、命名空间、属性映射和可选日期识别。
        </p>
      </section>
      <WorkspacePanel
        actions={actions}
        input={
          <section className="panel">
            <div className="panel__header">
              <div>
                <h2 className="panel__title">输入 JSON</h2>
                <p className="panel__hint">先配置生成选项，再输入 JSON 样本。</p>
              </div>
            </div>
            <div className="converter-form">
              <label className="field">
                <span className="field__label">根类名</span>
                <input
                  className="field__input"
                  value={rootClassName}
                  onChange={(event) => handleRootClassNameChange(event.target.value)}
                  placeholder="Root"
                />
              </label>
              <label className="field">
                <span className="field__label">命名空间</span>
                <input
                  className="field__input"
                  value={namespaceValue}
                  onChange={(event) => handleNamespaceChange(event.target.value)}
                  placeholder="MyTools.Generated"
                />
              </label>
              <label className="field field--checkbox">
                <input
                  type="checkbox"
                  checked={useJsonPropertyName}
                  onChange={(event) => handleUseJsonPropertyNameChange(event.target.checked)}
                />
                <span className="field__label">生成 JsonPropertyName 映射</span>
              </label>
              <label className="field field--checkbox">
                <input
                  type="checkbox"
                  checked={detectDateTime}
                  onChange={(event) => handleDetectDateTimeChange(event.target.checked)}
                />
                <span className="field__label">启用 DateTime 识别</span>
              </label>
            </div>
            <JsonEditor value={input} onChange={handleInputChange} />
          </section>
        }
        result={
          <ResultPanel
            title="输出 C#"
            description="仅在输入合法 JSON 后生成 C# 代码，非法 JSON 不会生成伪代码。"
            value={output}
            tone={!output ? (status.tone === 'error' ? 'error' : 'default') : 'success'}
            emptyText="执行“生成”后显示 C# Class 代码。"
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
