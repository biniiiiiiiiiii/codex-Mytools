export type JsonErrorDetail = {
  message: string
  line?: number
  column?: number
  hint: string
}

export type TransformResult =
  | {
      ok: true
      output: string
    }
  | {
      ok: false
      error: JsonErrorDetail
    }

export type ValidateResult =
  | {
      valid: true
    }
  | {
      valid: false
      error: JsonErrorDetail
    }

type ParseJsonResult =
  | {
      ok: true
      value: unknown
    }
  | {
      ok: false
      error: JsonErrorDetail
    }

function parseJson(input: string): ParseJsonResult {
  try {
    return {
      ok: true,
      value: JSON.parse(input),
    }
  } catch (error) {
    return {
      ok: false,
      error: normalizeJsonError(input, error),
    }
  }
}

export function formatJson(input: string): TransformResult {
  const parsed = parseJson(input)

  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.error,
    }
  }

  return {
    ok: true,
    output: JSON.stringify(parsed.value, null, 2),
  }
}

export function minifyJson(input: string): TransformResult {
  const parsed = parseJson(input)

  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.error,
    }
  }

  return {
    ok: true,
    output: JSON.stringify(parsed.value),
  }
}

export function validateJson(input: string): ValidateResult {
  const parsed = parseJson(input)

  if (parsed.ok) {
    return {
      valid: true,
    }
  }

  return {
    valid: false,
    error: parsed.error,
  }
}

function normalizeJsonError(input: string, error: unknown): JsonErrorDetail {
  const message = error instanceof Error ? error.message : '未知 JSON 解析错误'
  const { line, column } = extractLineColumn(input, message)

  return {
    message,
    line,
    column,
    hint: inferHint(message),
  }
}

function extractLineColumn(input: string, message: string) {
  const lineColumnMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i)
  if (lineColumnMatch) {
    return {
      line: Number(lineColumnMatch[1]),
      column: Number(lineColumnMatch[2]),
    }
  }

  const positionMatch = message.match(/position\s+(\d+)/i)
  if (!positionMatch) {
    return {}
  }

  const position = Number(positionMatch[1])
  return positionToLineColumn(input, position)
}

function positionToLineColumn(input: string, position: number) {
  // Some runtimes only report a flat character position, so map it back to line/column.
  const safePosition = Math.max(0, Math.min(position, input.length))
  const head = input.slice(0, safePosition)
  const lines = head.split('\n')

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  }
}

function inferHint(message: string) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('expected double-quoted property name')) {
    return '属性名必须使用双引号，或可能有尾随逗号。'
  }

  if (lowerMessage.includes('unterminated string')) {
    return '字符串可能未正确闭合。'
  }

  if (lowerMessage.includes('expected') && lowerMessage.includes('after property value')) {
    return '可能缺少逗号。'
  }

  if (lowerMessage.includes('unexpected token') && lowerMessage.includes(']')) {
    return '可能缺少元素之间的逗号，或数组提前结束。'
  }

  if (lowerMessage.includes('unexpected token') && lowerMessage.includes('}')) {
    return '可能有尾随逗号，或对象内容不完整。'
  }

  if (lowerMessage.includes('unexpected number')) {
    return '可能缺少逗号或冒号，导致数字出现在不合法的位置。'
  }

  if (lowerMessage.includes('unexpected string')) {
    return '可能缺少逗号，或前一个字符串未正确结束。'
  }

  return '请检查逗号、双引号、括号闭合和尾随逗号。'
}
