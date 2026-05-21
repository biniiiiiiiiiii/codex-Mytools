import { convertJsonToCSharp } from '../../shared/utils/csharp'
import type { ConverterOptions, ConverterResult } from './converter.types'

export function runConverter(input: string, options: ConverterOptions): ConverterResult {
  const result = convertJsonToCSharp(input, options)

  if (!result.ok) {
    return {
      ok: false,
      error: result.error.message,
      line: result.error.line,
      column: result.error.column,
      hint: result.error.hint,
    }
  }

  return result
}
