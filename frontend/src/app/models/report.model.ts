/**
 * Contract types for admin reports (R1–R4).
 * Mirrors backend report DTOs (Jackson default camelCase serialization).
 *
 * Sources:
 *   response/report/VentasPorPeriodoReport.java  (R1)
 *   response/report/VentasPeriodoRow.java         (R1 row)
 *   response/report/TopProductosReport.java       (R2)
 *   response/report/TopProductoRow.java           (R2 row)
 *   response/report/KardexReport.java             (R3)
 *   response/report/KardexMovimientoRow.java      (R3 row)
 *   response/report/OrdenesListadoReport.java     (R4 — reuses OrderResponse)
 *   model/enums/MovementType.java
 */

import { OrderResponse } from './order.model';

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

/** Mirrors `MovementType` enum (ENTRADA = stock in, SALIDA = stock out). */
export type MovementType = 'ENTRADA' | 'SALIDA';

// ---------------------------------------------------------------------------
// R1 — Ventas por período (sales by period)
// ---------------------------------------------------------------------------

/**
 * One bucket row for R1.
 * `periodo` mirrors `LocalDate` — Jackson serializes LocalDate as
 * an ISO date string "YYYY-MM-DD" by default (spring.jackson.serialization
 * .write-dates-as-timestamps=false implicit via JacksonAutoConfiguration).
 * DEFERRED: confirm against live response (P2.6).
 */
export interface VentasPeriodoRow {
  /** ISO date string "YYYY-MM-DD" — mirrors Java `LocalDate`. */
  periodo: string;
  ordenes: number;
  /**
   * Java `BigDecimal` → TS `number`.
   * PRECISION NOTE: IEEE-754 double may lose sub-cent precision. Academic scope.
   */
  monto: number;
}

export interface VentasPorPeriodoReport {
  /**
   * ISO 8601 string — mirrors Java `Instant`.
   * DEFERRED: confirm format against live backend response (P2.6).
   */
  desde: string;
  /** ISO 8601 string — mirrors Java `Instant`. DEFERRED: P2.6. */
  hasta: string;
  /** Granularity bucket: expected values are "DIA" or "MES" (backend-defined). */
  granularidad: string;
  totalOrdenes: number;
  /**
   * Java `BigDecimal` → TS `number`. PRECISION NOTE: academic scope.
   */
  totalFacturado: number;
  /**
   * Java `BigDecimal` → TS `number`. PRECISION NOTE: academic scope.
   */
  ticketPromedio: number;
  filas: VentasPeriodoRow[];
}

// ---------------------------------------------------------------------------
// R2 — Top productos (best-selling products)
// ---------------------------------------------------------------------------

export interface TopProductoRow {
  productId: number;
  sku: string;
  /** Spanish field name from backend record — `nombre` (NOT `name`). */
  nombre: string;
  /**
   * Java `Long` (boxed) → TS `number`.
   * NOTE: Hibernate 6.x returns boxed `Long` for `SUM(oi.quantity)` in JPQL
   * constructor expressions (empirically verified in backend integration tests).
   */
  unidades: number;
  /**
   * Java `BigDecimal` → TS `number`. PRECISION NOTE: academic scope.
   */
  ingresos: number;
}

export interface TopProductosReport {
  /** ISO 8601 string — mirrors Java `Instant`. DEFERRED: P2.6. */
  desde: string;
  /** ISO 8601 string — mirrors Java `Instant`. DEFERRED: P2.6. */
  hasta: string;
  limit: number;
  productos: TopProductoRow[];
}

// ---------------------------------------------------------------------------
// R3 — Kardex (stock movement history for a product)
// ---------------------------------------------------------------------------

export interface KardexMovimientoRow {
  /** ISO 8601 string — mirrors Java `Instant`. DEFERRED: P2.6. */
  fecha: string;
  /**
   * Backend record field is `String` (not the enum itself), so the JSON
   * value is the raw MovementType name ("ENTRADA" | "SALIDA").
   * We narrow to `MovementType` for type-safety.
   */
  tipo: MovementType;
  cantidad: number;
  reason: string;
  reference: string;
}

export interface KardexReport {
  productId: number;
  sku: string;
  /** Spanish field name from backend record — `nombre` (NOT `name`). */
  nombre: string;
  stockActual: number;
  /** ISO 8601 string — mirrors Java `Instant`. DEFERRED: P2.6. */
  desde: string;
  /** ISO 8601 string — mirrors Java `Instant`. DEFERRED: P2.6. */
  hasta: string;
  movimientos: KardexMovimientoRow[];
}

// ---------------------------------------------------------------------------
// R4 — Órdenes listado (order listing with filters)
// ---------------------------------------------------------------------------

/**
 * R4 reuses `OrderResponse` directly (backend does the same:
 * `OrdenesListadoReport` embeds `List<OrderResponse>`).
 */
export interface OrdenesListadoReport {
  /**
   * Optional status filter applied on the server. `null` means no filter.
   * Backend field is `String` (not enum) — we keep it as `string | null`.
   */
  statusFiltro: string | null;
  /** ISO 8601 string — mirrors Java `Instant`. DEFERRED: P2.6. */
  desde: string;
  /** ISO 8601 string — mirrors Java `Instant`. DEFERRED: P2.6. */
  hasta: string;
  /** Optional user filter. `null` means all users. */
  userId: number | null;
  /** Total matching orders (before any pagination). */
  total: number;
  ordenes: OrderResponse[];
}
