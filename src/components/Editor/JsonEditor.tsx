import Editor from '@monaco-editor/react'

type JsonEditorProps = {
  value: string
  onChange?: (value: string) => void
  language?: string
  readonly?: boolean
  height?: number
}

export function JsonEditor({
  value,
  onChange,
  language = 'json',
  readonly = false,
  height = 420,
}: JsonEditorProps) {
  return (
    <div className="editor">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(nextValue) => onChange?.(nextValue ?? '')}
        options={{
          minimap: { enabled: false },
          fontFamily: 'Cascadia Code, Consolas, monospace',
          fontSize: 14,
          lineNumbersMinChars: 3,
          padding: { top: 14, bottom: 14 },
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: readonly,
          wordWrap: 'on',
          tabSize: 2,
        }}
        theme="vs"
      />
    </div>
  )
}
