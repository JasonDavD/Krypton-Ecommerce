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

    @Test
    void v2_adds_active_column_to_users() {
        List<String> columns = jdbcTemplate.queryForList(
                "SELECT column_name FROM information_schema.columns "
                        + "WHERE table_schema = 'public' AND table_name = 'users'",
                String.class);

        assertThat(columns).contains("active");
    }

    // ─── V5: product_image table + indexes ──────────────────────────────────────

    @Test
    void v5_creates_product_image_table() {
        List<String> tables = jdbcTemplate.queryForList(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
                String.class);

        assertThat(tables).contains("product_image");
    }

    @Test
    void v5_product_image_has_expected_columns() {
        List<String> columns = jdbcTemplate.queryForList(
                "SELECT column_name FROM information_schema.columns "
                        + "WHERE table_schema = 'public' AND table_name = 'product_image'",
                String.class);

        assertThat(columns).contains("id", "product_id", "path", "display_order", "is_cover", "created_at");
    }

    @Test
    void v5_creates_idx_product_image_product() {
        List<String> indexes = jdbcTemplate.queryForList(
                "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'product_image'",
                String.class);

        assertThat(indexes).contains("idx_product_image_product");
    }

    @Test
    void v5_creates_partial_unique_idx_product_image_cover() {
        List<String> indexes = jdbcTemplate.queryForList(
                "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'product_image'",
                String.class);

        assertThat(indexes).contains("idx_product_image_cover");
    }

    @Test
    void v5_idx_product_image_cover_is_unique_and_partial() {
        // pg_indexes + pg_class/pg_index to verify the partial unique constraint
        Boolean isUnique = jdbcTemplate.queryForObject(
                "SELECT ix.indisunique FROM pg_indexes pi "
                        + "JOIN pg_class c ON c.relname = pi.indexname "
                        + "JOIN pg_index ix ON ix.indexrelid = c.oid "
                        + "WHERE pi.schemaname = 'public' "
                        + "  AND pi.tablename = 'product_image' "
                        + "  AND pi.indexname = 'idx_product_image_cover'",
                Boolean.class);

        assertThat(isUnique).isTrue();

        // Verify the WHERE predicate exists (indexdef contains WHERE)
        String indexDef = jdbcTemplate.queryForObject(
                "SELECT indexdef FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_product_image_cover'",
                String.class);

        assertThat(indexDef).containsIgnoringCase("WHERE");
        assertThat(indexDef).containsIgnoringCase("is_cover");
    }
}
