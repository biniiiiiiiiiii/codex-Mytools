export type ConverterOptions = {
  rootClassName: string
  namespace?: string
  useJsonPropertyName?: boolean
  detectDateTime?: boolean
}

export type ConverterResult =
  | {
      ok: true
      output: string
    }
  | {
      ok: false
      error: string
      line?: number
      column?: number
      hint?: string
    }
