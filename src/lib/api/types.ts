export type ApiError = {
  message: string
  code?: number
  details?: any
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}
