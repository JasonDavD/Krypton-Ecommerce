package pe.com.krypton;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Verifica que la migración Flyway V1 crea las 8 tablas del modelo
 * sobre un PostgreSQL real (Testcontainers, NO H2 — paridad con prod).
 */
class SchemaIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Test
    void v1_creates_the_eight_model_tables() {
        List<String> tables = jdbcTemplate.queryForList(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
                String.class);

        assertThat(tables).contains(
                "users", "categories", "products", "cart",
                "cart_item", "orders", "order_items", "stock_movement");
    }
}
