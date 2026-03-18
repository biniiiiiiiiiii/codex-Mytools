import type { FormatterMode, FormatterResult } from './formatter.types'
import { formatJson, minifyJson } from '../../shared/utils/json'

export function runFormatter(input: string, mode: FormatterMode): FormatterResult {
  const result = mode === 'format' ? formatJson(input) : minifyJson(input)

  if (!result.ok) {
    return {
      ok: false,
      output: '',
      error: result.error.message,
    }
  }

  return {
    ok: true,
    output: result.output,
  }
}
