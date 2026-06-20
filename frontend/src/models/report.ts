/**
 * Tipos de los reportes para el dashboard. Reflejan los DTOs del backend
 * (los mismos que alimentan los exports Excel/PDF, ahora servidos como JSON).
 */

/** Una fila de ventas por bucket de período (día o mes), zona Lima. */
export interface VentasPeriodoRow {
  /** LocalDate ISO (YYYY-MM-DD). */
  periodo: string;
  ordenes: number;
  monto: number;
}

export interface VentasPorPeriodoReport {
  desde: string;
  hasta: string;
  granularidad: string;
  totalOrdenes: number;
  totalFacturado: number;
  ticketPromedio: number;
  filas: VentasPeriodoRow[];
}

export interface TopProductoRow {
  productId: number;
  sku: string;
  nombre: string;
  unidades: number;
  ingresos: number;
}

export interface TopProductosReport {
  desde: string | null;
  hasta: string | null;
  limit: number;
  productos: TopProductoRow[];
}
