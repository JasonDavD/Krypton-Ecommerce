/**
 * Shared API contract types: error envelope.
 * Mirrors backend exception/ApiError.java (Jackson default camelCase).
 *
 * Source: exception/ApiError.java
 *   public record ApiError(int status, String error) {}
 *
 * Used by ErrorInterceptor to read the error body on 4xx/5xx responses.
 */

export interface ApiError {
  /** HTTP status code echoed in the body (e.g. 400, 401, 404, 409, 422). */
  status: number;
  /** Human-readable error message (validation detail, business rule message, etc.). */
  error: string;
}
