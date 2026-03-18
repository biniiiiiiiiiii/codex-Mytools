import { validateJson } from '../../shared/utils/json'
import type { ValidationResult } from './validator.types'

export function runValidation(input: string): ValidationResult {
  const result = validateJson(input)

  if (result.valid) {
    return {
      valid: true,
      summary: 'JSON 合法',
    }
  }

  return {
    valid: false,
    summary: result.error.message,
    line: result.error.line,
    column: result.error.column,
    hint: result.error.hint,
  }
}
