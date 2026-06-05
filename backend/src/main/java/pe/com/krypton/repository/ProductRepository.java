package pe.com.krypton.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.com.krypton.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
