package pe.com.krypton.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.com.krypton.dto.request.OrderStatusUpdateRequest;
import pe.com.krypton.dto.response.OrderResponse;
import pe.com.krypton.dto.response.PageResponse;
import pe.com.krypton.service.OrderService;

/**
 * Admin order management endpoints.
 * Authorization: /api/admin/** → hasRole("ADMIN") enforced by SecurityConfig.
 * No @AuthenticationPrincipal needed — admin context is not ownership-scoped.
 * Satisfies REQ-OM-10..REQ-OM-12, REQ-OM-13.
 */
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    /** GET /api/admin/orders → 200 PageResponse<OrderResponse> (all orders, paginated) */
    @GetMapping
    public PageResponse<OrderResponse> getAllOrders(Pageable pageable) {
        return orderService.getAllOrders(pageable);
    }

    /** GET /api/admin/orders/{id} → 200 OrderResponse (any user's order, 404 if not found) */
    @GetMapping("/{id}")
    public OrderResponse getOrder(@PathVariable Long id) {
        return orderService.getOrder(id);
    }

    /** PUT /api/admin/orders/{id}/status → 200 OrderResponse (transición validada; 422 si es ilegal) */
    @PutMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id,
                                      @Valid @RequestBody OrderStatusUpdateRequest request) {
        return orderService.updateStatus(id, request.status());
    }
}
