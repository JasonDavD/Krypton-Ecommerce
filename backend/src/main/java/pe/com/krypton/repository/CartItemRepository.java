package pe.com.krypton.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.com.krypton.model.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
