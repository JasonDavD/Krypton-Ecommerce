package pe.com.krypton.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.com.krypton.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
}
