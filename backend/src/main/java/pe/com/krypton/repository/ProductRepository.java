package pe.com.krypton.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pe.com.krypton.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    boolean existsByCategoryId(Long categoryId);
}
