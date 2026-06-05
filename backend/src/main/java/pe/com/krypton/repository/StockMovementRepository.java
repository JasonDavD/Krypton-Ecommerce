package pe.com.krypton.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.com.krypton.model.StockMovement;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
}
