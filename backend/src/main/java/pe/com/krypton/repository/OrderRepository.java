package pe.com.krypton.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.com.krypton.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
