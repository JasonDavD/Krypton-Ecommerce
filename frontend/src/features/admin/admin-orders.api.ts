import { api } from '../../lib/api';
import type { OrderResponse, OrderStatus } from '../../models/order';
import type { PageResponse } from '../../models/product';

/** GET /api/admin/orders — todos los pedidos, paginado, más nuevos primero. */
export async function getAllOrders(page: number, size = 10): Promise<PageResponse<OrderResponse>> {
  const { data } = await api.get<PageResponse<OrderResponse>>('/api/admin/orders', {
    params: { page, size, sort: 'orderDate,desc' },
  });
  return data;
}

/** GET /api/admin/orders/{id} — cualquier pedido (404 si no existe). */
export async function getAdminOrder(id: number): Promise<OrderResponse> {
  const { data } = await api.get<OrderResponse>(`/api/admin/orders/${id}`);
  return data;
}

/**
 * PUT /api/admin/orders/{id}/status — cambia el estado respetando la máquina de
 * estados (PENDIENTE→{CONFIRMADA,CANCELADA}, CONFIRMADA→{CANCELADA}). 422 si es ilegal.
 */
export async function updateOrderStatus(id: number, status: OrderStatus): Promise<OrderResponse> {
  const { data } = await api.put<OrderResponse>(`/api/admin/orders/${id}/status`, { status });
  return data;
}
