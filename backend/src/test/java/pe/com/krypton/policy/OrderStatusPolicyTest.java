package pe.com.krypton.policy;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static pe.com.krypton.model.enums.OrderStatus.CANCELADA;
import static pe.com.krypton.model.enums.OrderStatus.CONFIRMADA;
import static pe.com.krypton.model.enums.OrderStatus.PENDIENTE;

import org.junit.jupiter.api.Test;
import pe.com.krypton.exception.OrderStatusTransitionException;

/**
 * Unit test for OrderStatusPolicy — pure domain rule, no Spring.
 * Cubre la matriz 3×3 de transiciones de OrderStatus.
 * Strict TDD: RED → GREEN → REFACTOR.
 */
class OrderStatusPolicyTest {

    private final OrderStatusPolicy policy = new OrderStatusPolicy();

    // ─── transiciones legales ─────────────────────────────────────────────────────

    @Test
    void should_allow_when_pendiente_to_confirmada() {
        assertThatCode(() -> policy.assertCanTransition(PENDIENTE, CONFIRMADA))
                .doesNotThrowAnyException();
    }

    @Test
    void should_allow_when_pendiente_to_cancelada() {
        assertThatCode(() -> policy.assertCanTransition(PENDIENTE, CANCELADA))
                .doesNotThrowAnyException();
    }

    @Test
    void should_allow_when_confirmada_to_cancelada() {
        assertThatCode(() -> policy.assertCanTransition(CONFIRMADA, CANCELADA))
                .doesNotThrowAnyException();
    }

    // ─── transiciones ilegales: hacia atrás ───────────────────────────────────────

    @Test
    void should_throw_when_confirmada_to_pendiente() {
        assertThatThrownBy(() -> policy.assertCanTransition(CONFIRMADA, PENDIENTE))
                .isInstanceOf(OrderStatusTransitionException.class);
    }

    // ─── transiciones ilegales: CANCELADA es terminal ─────────────────────────────

    @Test
    void should_throw_when_cancelada_to_confirmada() {
        assertThatThrownBy(() -> policy.assertCanTransition(CANCELADA, CONFIRMADA))
                .isInstanceOf(OrderStatusTransitionException.class);
    }

    @Test
    void should_throw_when_cancelada_to_pendiente() {
        assertThatThrownBy(() -> policy.assertCanTransition(CANCELADA, PENDIENTE))
                .isInstanceOf(OrderStatusTransitionException.class);
    }

    // ─── transiciones ilegales: auto-transición (idempotencia rechazada) ──────────

    @Test
    void should_throw_when_pendiente_to_pendiente() {
        assertThatThrownBy(() -> policy.assertCanTransition(PENDIENTE, PENDIENTE))
                .isInstanceOf(OrderStatusTransitionException.class);
    }

    @Test
    void should_throw_when_confirmada_to_confirmada() {
        assertThatThrownBy(() -> policy.assertCanTransition(CONFIRMADA, CONFIRMADA))
                .isInstanceOf(OrderStatusTransitionException.class);
    }

    @Test
    void should_throw_when_cancelada_to_cancelada() {
        assertThatThrownBy(() -> policy.assertCanTransition(CANCELADA, CANCELADA))
                .isInstanceOf(OrderStatusTransitionException.class);
    }
}
