package pe.com.krypton.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        Long userId,
        Instant orderDate,
        String status,
        BigDecimal total,
        List<OrderItemResponse> items) {
}
