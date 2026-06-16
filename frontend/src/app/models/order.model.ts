/**
 * Contract types for orders.
 * Mirrors backend DTOs (Jackson default camelCase serialization).
 *
 * Sources:
 *   request/OrderStatusUpdateRequest.java, request/PaymentRequest.java
 *   response/OrderItemResponse.java, response/OrderResponse.java
 *   model/enums/OrderStatus.java, model/enums/PaymentMethod.java
 *
 * NOTE on OrderResponse.status: the backend field is typed as `String` (not
 * the enum itself), so the JSON value is the raw enum name string.
 * We narrow it here to the known union for type-safety on the frontend.
 */

// ---------------------------------------------------------------------------
// Enums as union types
// ---------------------------------------------------------------------------

/** Mirrors `OrderStatus` enum: raw string values as serialized by Jackson. */
export type OrderStatus = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';

/** Mirrors `PaymentMethod` enum: raw string values as serialized by Jackson. */
export type PaymentMethod = 'CREDIT_CARD' | 'YAPE' | 'EFECTIVO';

// ---------------------------------------------------------------------------
// Request DTOs
// ---------------------------------------------------------------------------

/** Admin-only: transition an order to a new status. */
export interface OrderStatusUpdateRequest {
  status: OrderStatus;
}

/** Checkout: specify payment method to confirm the order. */
export interface PaymentRequest {
  method: PaymentMethod;
}

// ---------------------------------------------------------------------------
// Response DTOs
// ---------------------------------------------------------------------------

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  /**
   * Java `BigDecimal` → TS `number`.
   * PRECISION NOTE: IEEE-754 double may lose sub-cent precision. Academic scope.
   */
  unitPrice: number;
  /**
   * Java `BigDecimal` → TS `number`.
   * PRECISION NOTE: IEEE-754 double may lose sub-cent precision. Academic scope.
   */
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  userId: number;
  /**
   * ISO 8601 string (e.g. "2026-06-15T20:46:36.123456Z").
   * Spring Boot JacksonAutoConfiguration disables WRITE_DATES_AS_TIMESTAMPS by
   * default, so Instant serializes as an ISO string — NOT epoch ms.
   * DEFERRED: confirm format against a live backend response (P2.6).
   */
  orderDate: string;
  /**
   * Backend field is `String` (not the enum type), so any status value is
   * technically possible. We narrow to `OrderStatus` for type-safety; if the
   * backend returns an unexpected value TypeScript will not catch it at runtime.
   */
  status: OrderStatus;
  /**
   * Java `BigDecimal` → TS `number`.
   * PRECISION NOTE: IEEE-754 double may lose sub-cent precision. Academic scope.
   */
  total: number;
  items: OrderItemResponse[];
}
