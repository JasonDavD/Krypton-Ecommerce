/**
 * Contract types for products and categories.
 * Mirrors backend DTOs (Jackson default camelCase serialization).
 *
 * Sources:
 *   request/CategoryRequest.java, response/CategoryResponse.java
 *   request/ProductRequest.java, response/ProductResponse.java
 *   response/PageResponse.java
 */

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export interface CategoryRequest {
  name: string;
  description?: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description: string | null;
}

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export interface ProductRequest {
  sku: string;
  name: string;
  description?: string;
  /**
   * Java `BigDecimal` → TS `number`.
   * PRECISION NOTE: IEEE-754 double may lose sub-cent precision on large
   * monetary values. Accepted limitation for academic scope; production systems
   * should serialize BigDecimal as a string and use a decimal library client-side.
   */
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: number;
}

export interface ProductResponse {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  /**
   * Java `BigDecimal` → TS `number`.
   * PRECISION NOTE: IEEE-754 double may lose sub-cent precision on large
   * monetary values. Accepted limitation for academic scope; production systems
   * should serialize BigDecimal as a string and use a decimal library client-side.
   */
  price: number;
  stock: number;
  imageUrl: string | null;
  active: boolean;
  categoryId: number;
  categoryName: string;
}

// ---------------------------------------------------------------------------
// Pagination wrapper — generic, mirrors PageResponse<T>
// ---------------------------------------------------------------------------

/**
 * Generic pagination envelope.
 * Mirrors `PageResponse<T>` from Spring Data — stable contract that does NOT
 * expose Spring internals (e.g. `Pageable`, `Sort`).
 */
export interface PageResponse<T> {
  content: T[];
  /** Zero-based page index (Spring Data `Page.getNumber()`). */
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
