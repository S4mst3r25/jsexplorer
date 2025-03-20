export type Task = {
  id: string
  name: string
  type: 'function' | 'async' | 'promise'
  line?: number
  column?: number
  endLine?: number
  endColumn?: number
  fadeOut?: boolean
}

export type BoxPosition = {
  x: number
  y: number
  width: number
  height: number
}