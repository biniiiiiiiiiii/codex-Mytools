export type ValidationResult = {
  valid: true
  summary: string
  line?: undefined
  column?: undefined
  hint?: undefined
} | {
  valid: false
  summary: string
  line?: number
  column?: number
  hint?: string
}
