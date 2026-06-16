/**
 * Contract types for authentication and user management.
 * Mirrors backend DTOs (Jackson default camelCase serialization).
 *
 * Sources:
 *   request/LoginRequest.java, request/RegisterRequest.java
 *   request/CreateUserRequest.java, request/UpdateRoleRequest.java, request/UpdateStatusRequest.java
 *   response/AuthResponse.java, response/UserResponse.java
 *   model/enums/Role.java
 */

/** Union type mirroring Role enum (CLIENTE | ADMIN). */
export type Role = 'CLIENTE' | 'ADMIN';

// ---------------------------------------------------------------------------
// Request DTOs
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/** Admin-only: create a user with an explicit role assignment. */
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

/** Admin-only: change the role of an existing user. */
export interface UpdateRoleRequest {
  role: Role;
}

/** Admin-only: toggle active/inactive status of a user. */
export interface UpdateStatusRequest {
  active: boolean;
}

// ---------------------------------------------------------------------------
// Response DTOs
// ---------------------------------------------------------------------------

export interface AuthResponse {
  token: string;
  tokenType: string;
  /** Duration in seconds until the token expires. Java `long` → TS `number`. */
  expiresIn: number;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  /**
   * ISO 8601 string (e.g. "2026-06-15T20:46:36.123456Z").
   * Spring Boot JacksonAutoConfiguration disables WRITE_DATES_AS_TIMESTAMPS by
   * default, so Instant serializes as an ISO string — NOT epoch ms.
   * DEFERRED: assert `typeof createdAt === 'string' && !isNaN(new Date(createdAt).getTime())`
   * against a live backend response once the API is reachable (P2.6).
   */
  createdAt: string;
}
