/**
 * Contract types for the shopping cart.
 * Mirrors backend DTOs (Jackson default camelCase serialization).
 *
 * Sources:
 *   request/CartItemRequest.java, request/UpdateQuantityRequest.java
 *   response/CartItemResponse.java, response/CartResponse.java
 */

// ---------------------------------------------------------------------------
// Request DTOs
// ---------------------------------------------------------------------------

/** Add a product to the cart (or increase quantity if already present). */
export interface CartItemRequest {
  productId: number;
  quantity: number;
}

/** Update the quantity of an existing cart item. `quantity` must be >= 1. */
export interface UpdateQuantityRequest {
  quantity: number;
}

// ---------------------------------------------------------------------------
// Response DTOs
// ---------------------------------------------------------------------------

export interface CartItemResponse {
  itemId: number;
  productId: number;
  productName: string;
  sku: string;
  /**
   * Java `BigDecimal` → TS `number`.
   * PRECISION NOTE: IEEE-754 double may lose sub-cent precision on large
   * monetary values. Accepted limitation for academic scope.
   */
  price: number;
  quantity: number;
  /**
   * Java `BigDecimal` → TS `number`.
   * PRECISION NOTE: IEEE-754 double may lose sub-cent precision. Academic scope.
   */
  subtotal: number;
}

export interface CartResponse {
  cartId: number;
  items: CartItemResponse[];
  /**
   * Java `BigDecimal` → TS `number`.
   * PRECISION NOTE: IEEE-754 double may lose sub-cent precision. Academic scope.
   */
  total: number;
  /**
   * ISO 8601 string (e.g. "2026-06-15T20:46:36.123456Z").
   * Spring Boot JacksonAutoConfiguration disables WRITE_DATES_AS_TIMESTAMPS by
   * default, so Instant serializes as an ISO string — NOT epoch ms.
   * DEFERRED: confirm format against a live backend response (P2.6).
   */
  updatedAt: string;
}
