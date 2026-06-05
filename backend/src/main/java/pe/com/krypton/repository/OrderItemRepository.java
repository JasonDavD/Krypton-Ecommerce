package pe.com.krypton.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.com.krypton.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
