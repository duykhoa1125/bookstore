export interface ApiResponseMeta {
  timestamp: string;
  requestId: string;
  [key: string]: unknown;
}

export type ApiErrorPayload =
  | Record<string, string[]>
  | string[]
  | string
  | null;

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  errors: ApiErrorPayload;
  meta: ApiResponseMeta;
}
