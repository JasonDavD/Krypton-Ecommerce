package pe.com.krypton.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.com.krypton.model.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {
}
