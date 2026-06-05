package pe.com.krypton.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.com.krypton.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
