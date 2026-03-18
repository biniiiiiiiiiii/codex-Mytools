export type FormatterMode = 'format' | 'minify'

export type FormatterResult = {
  ok: true
  output: string
} | {
  ok: false
  output: string
  error: string
}
