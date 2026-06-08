package pe.com.krypton.service;

import java.util.List;
import org.springframework.data.domain.Pageable;
import pe.com.krypton.dto.request.PaymentRequest;
import pe.com.krypton.dto.response.OrderResponse;
import pe.com.krypton.dto.response.PageResponse;
import pe.com.krypton.model.enums.OrderStatus;

public interface OrderService {

    /** Atomic checkout: cart → Order (PENDIENTE), stock decrement, StockMovement, clear cart. */
    OrderResponse checkout(String email);

    /** Returns the authenticated client's orders ordered by date DESC. */
    List<OrderResponse> getMyOrders(String email);

    /** Returns the client's own order detail. Throws ResourceNotFoundException (404) if IDOR. */
    OrderResponse getMyOrder(String email, Long orderId);

    /**
     * Simulated payment: PENDIENTE → CONFIRMADA.
     * Throws ResourceNotFoundException (404) if IDOR.
     * Throws OrderStatusTransitionException (422) if not PENDIENTE.
     */
    OrderResponse pay(String email, Long orderId, PaymentRequest request);

    /** Admin: paginated list of ALL orders. */
    PageResponse<OrderResponse> getAllOrders(Pageable pageable);

    /** Admin: single order by id. Throws ResourceNotFoundException (404) if not found. */
    OrderResponse getOrder(Long orderId);

    /** Admin: free-form status update (no transition guard). */
    OrderResponse updateStatus(Long orderId, OrderStatus newStatus);
}
