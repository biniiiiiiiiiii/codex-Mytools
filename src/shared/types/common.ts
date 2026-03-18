export type StatusTone = 'idle' | 'success' | 'error'

export type OperationStatus = {
  tone: StatusTone
  message: string
}
