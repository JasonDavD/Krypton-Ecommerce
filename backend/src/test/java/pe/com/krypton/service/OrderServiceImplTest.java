package pe.com.krypton.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import pe.com.krypton.dto.request.PaymentRequest;
import pe.com.krypton.dto.response.OrderResponse;
import pe.com.krypton.dto.response.PageResponse;
import pe.com.krypton.exception.EmptyCartException;
import pe.com.krypton.exception.InsufficientStockException;
import pe.com.krypton.exception.OrderStatusTransitionException;
import pe.com.krypton.exception.ResourceNotFoundException;
import pe.com.krypton.mapper.OrderMapper;
import pe.com.krypton.model.Cart;
import pe.com.krypton.model.CartItem;
import pe.com.krypton.model.Order;
import pe.com.krypton.model.OrderItem;
import pe.com.krypton.model.Product;
import pe.com.krypton.model.StockMovement;
import pe.com.krypton.model.User;
import pe.com.krypton.model.enums.MovementType;
import pe.com.krypton.model.enums.OrderStatus;
import pe.com.krypton.model.enums.PaymentMethod;
import pe.com.krypton.repository.CartItemRepository;
import pe.com.krypton.repository.CartRepository;
import pe.com.krypton.repository.OrderItemRepository;
import pe.com.krypton.repository.OrderRepository;
import pe.com.krypton.repository.ProductRepository;
import pe.com.krypton.repository.StockMovementRepository;
import pe.com.krypton.repository.UserRepository;
import pe.com.krypton.service.impl.OrderServiceImpl;

/**
 * Unit test for OrderServiceImpl. All repos + CartService + OrderMapper mocked.
 * Strict TDD: RED → GREEN → REFACTOR per group.
 * Satisfies REQ-OM-01..REQ-OM-12 / ADR-1..ADR-9 / ADR-10.
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock OrderRepository orderRepository;
    @Mock OrderItemRepository orderItemRepository;
    @Mock ProductRepository productRepository;
    @Mock StockMovementRepository stockMovementRepository;
    @Mock CartRepository cartRepository;
    @Mock CartItemRepository cartItemRepository;
    @Mock UserRepository userRepository;
    @Mock CartService cartService;
    @Mock OrderMapper orderMapper;

    OrderServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new OrderServiceImpl(
                orderRepository, orderItemRepository, productRepository,
                stockMovementRepository, cartRepository, cartItemRepository,
                userRepository, cartService, orderMapper);
    }

    // ─── helpers ────────────────────────────────────────────────────────────────

    private User user(Long id, String email) {
        User u = new User();
        u.setId(id);
        u.setEmail(email);
        return u;
    }

    private Cart cart(Long id, User user) {
        Cart c = new Cart();
        c.setId(id);
        c.setUser(user);
        c.setCreatedAt(Instant.now());
        c.setUpdatedAt(Instant.now());
        return c;
    }

    private Product product(Long id, String name, BigDecimal price, int stock) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setPrice(price);
        p.setStock(stock);
        p.setActive(true);
        return p;
    }

    private CartItem cartItem(Long id, Cart cart, Product product, int qty) {
        CartItem ci = new CartItem();
        ci.setId(id);
        ci.setCart(cart);
        ci.setProduct(product);
        ci.setQuantity(qty);
        return ci;
    }

    private Order order(Long id, User user, BigDecimal total, OrderStatus status) {
        Order o = new Order();
        o.setId(id);
        o.setUser(user);
        o.setTotal(total);
        o.setStatus(status);
        o.setOrderDate(Instant.now());
        return o;
    }

    private OrderItem orderItem(Long id, Order order, Product product, int qty, BigDecimal unitPrice) {
        OrderItem oi = new OrderItem();
        oi.setId(id);
        oi.setOrder(order);
        oi.setProduct(product);
        oi.setQuantity(qty);
        oi.setUnitPrice(unitPrice);
        return oi;
    }

    private OrderResponse sampleResponse() {
        return new OrderResponse(1L, 3L, Instant.now(), "PENDIENTE",
                new BigDecimal("299.90"), List.of());
    }

    // ─── CHECKOUT GROUP ─────────────────────────────────────────────────────────

    @Test
    void checkout_happy_path_creates_order_items_movements_and_clears_cart() {
        String email = "client@krypton.pe";
        User u = user(3L, email);
        Cart c = cart(1L, u);
        Product p = product(10L, "Notebook", new BigDecimal("299.90"), 5);
        CartItem ci = cartItem(1L, c, p, 2);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(u));
        when(cartRepository.findByUser(u)).thenReturn(Optional.of(c));
        when(cartItemRepository.findByCart(c)).thenReturn(List.of(ci));
        when(productRepository.findByIdWithLock(10L)).thenReturn(Optional.of(p));

        // Order saved returns an order with id=1
        Order savedOrder = order(1L, u, new BigDecimal("599.80"), OrderStatus.PENDIENTE);
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        OrderItem savedOrderItem = orderItem(1L, savedOrder, p, 2, new BigDecimal("299.90"));
        when(orderItemRepository.save(any(OrderItem.class))).thenReturn(savedOrderItem);
        when(stockMovementRepository.save(any(StockMovement.class))).thenReturn(new StockMovement());

        OrderResponse expectedResponse = sampleResponse();
        when(orderMapper.toResponse(eq(savedOrder), any())).thenReturn(expectedResponse);

        OrderResponse result = service.checkout(email);

        assertThat(result).isNotNull();

        // Verify order saved with PENDIENTE and correct total
        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(orderCaptor.capture());
        Order capturedOrder = orderCaptor.getValue();
        assertThat(capturedOrder.getStatus()).isEqualTo(OrderStatus.PENDIENTE);
        assertThat(capturedOrder.getTotal()).isEqualByComparingTo(new BigDecimal("599.80")); // 2×299.90

        // Verify OrderItem saved with price snapshot
        ArgumentCaptor<OrderItem> itemCaptor = ArgumentCaptor.forClass(OrderItem.class);
        verify(orderItemRepository).save(itemCaptor.capture());
        OrderItem capturedItem = itemCaptor.getValue();
        assertThat(capturedItem.getUnitPrice()).isEqualByComparingTo(new BigDecimal("299.90"));
        assertThat(capturedItem.getQuantity()).isEqualTo(2);

        // Verify stock decremented
        assertThat(p.getStock()).isEqualTo(3); // 5 - 2
        verify(productRepository).save(p);

        // Verify StockMovement saved with SALIDA type
        ArgumentCaptor<StockMovement> movCaptor = ArgumentCaptor.forClass(StockMovement.class);
        verify(stockMovementRepository).save(movCaptor.capture());
        StockMovement capturedMov = movCaptor.getValue();
        assertThat(capturedMov.getType()).isEqualTo(MovementType.SALIDA);
        assertThat(capturedMov.getReason()).isEqualTo("Venta orden #1");
        assertThat(capturedMov.getReference()).isEqualTo("ORDER-1");
        assertThat(capturedMov.getCreatedBy()).isNull();
        assertThat(capturedMov.getQuantity()).isEqualTo(2);

        // Verify cart cleared
        verify(cartService).clearCart(email);
    }

    @Test
    void checkout_empty_cart_throws_EmptyCartException_and_no_order_saved() {
        String email = "client@krypton.pe";
        User u = user(3L, email);
        Cart c = cart(1L, u);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(u));
        when(cartRepository.findByUser(u)).thenReturn(Optional.of(c));
        when(cartItemRepository.findByCart(c)).thenReturn(List.of()); // empty cart

        assertThatThrownBy(() -> service.checkout(email))
                .isInstanceOf(EmptyCartException.class);

        verify(orderRepository, never()).save(any());
        verify(stockMovementRepository, never()).save(any());
        verify(cartService, never()).clearCart(any());
    }

    @Test
    void checkout_no_cart_throws_EmptyCartException() {
        String email = "client@krypton.pe";
        User u = user(3L, email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(u));
        when(cartRepository.findByUser(u)).thenReturn(Optional.empty()); // no cart at all

        assertThatThrownBy(() -> service.checkout(email))
                .isInstanceOf(EmptyCartException.class);

        verify(orderRepository, never()).save(any());
    }

    @Test
    void checkout_insufficient_stock_throws_and_no_order_saved() {
        String email = "client@krypton.pe";
        User u = user(3L, email);
        Cart c = cart(1L, u);
        Product p = product(10L, "Notebook", new BigDecimal("299.90"), 1); // only 1 in stock
        CartItem ci = cartItem(1L, c, p, 5); // requesting 5

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(u));
        when(cartRepository.findByUser(u)).thenReturn(Optional.of(c));
        when(cartItemRepository.findByCart(c)).thenReturn(List.of(ci));
        when(productRepository.findByIdWithLock(10L)).thenReturn(Optional.of(p));

        assertThatThrownBy(() -> service.checkout(email))
                .isInstanceOf(InsufficientStockException.class);

        // No order, no stock movement persisted
        verify(orderRepository, never()).save(any());
        verify(stockMovementRepository, never()).save(any());
        verify(cartService, never()).clearCart(any());
    }

    @Test
    void checkout_product_not_found_throws_ResourceNotFoundException() {
        String email = "client@krypton.pe";
        User u = user(3L, email);
        Cart c = cart(1L, u);
        Product p = product(99L, "Ghost", BigDecimal.TEN, 5);
        CartItem ci = cartItem(1L, c, p, 1);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(u));
        when(cartRepository.findByUser(u)).thenReturn(Optional.of(c));
        when(cartItemRepository.findByCart(c)).thenReturn(List.of(ci));
        when(productRepository.findByIdWithLock(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.checkout(email))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(orderRepository, never()).save(any());
    }

    // ─── READ GROUP ──────────────────────────────────────────────────────────────

    @Test
    void getMyOrders_returns_only_authenticated_user_orders_ordered_by_date_desc() {
        String email = "client@krypton.pe";
        User u = user(3L, email);

        Order o1 = order(1L, u, BigDecimal.TEN, OrderStatus.PENDIENTE);
        Order o2 = order(2L, u, BigDecimal.TEN, OrderStatus.CONFIRMADA);
        List<Order> orders = List.of(o2, o1); // newest first

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(u));
        when(orderRepository.findByUserOrderByOrderDateDesc(u)).thenReturn(orders);
        when(orderItemRepository.findByOrder(any())).thenReturn(List.of());
        when(orderMapper.toResponse(any(), any())).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            return new OrderResponse(o.getId(), 3L, o.getOrderDate(), o.getStatus().name(),
                    o.getTotal(), List.of());
        });

        List<OrderResponse> result = service.getMyOrders(email);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).id()).isEqualTo(2L); // newest first
        assertThat(result.get(1).id()).isEqualTo(1L);
    }

    @Test
    void getMyOrder_returns_order_when_owner_matches() {
        String email = "client@krypton.pe";
        User u = user(3L, email);
        Order o = order(5L, u, BigDecimal.TEN, OrderStatus.PENDIENTE);
        List<OrderItem> items = List.of();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(u));
        when(orderRepository.findByIdAndUser(5L, u)).thenReturn(Optional.of(o));
        when(orderItemRepository.findByOrder(o)).thenReturn(items);
        when(orderMapper.toResponse(o, items)).thenReturn(sampleResponse());

        OrderResponse result = service.getMyOrder(email, 5L);

        assertThat(result).isNotNull();
    }

    @Test
    void getMyOrder_IDOR_throws_ResourceNotFoundException() {
        String email = "client@krypton.pe";
        User u = user(3L, email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(u));
        when(orderRepository.findByIdAndUser(9L, u)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getMyOrder(email, 9L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── PAY GROUP ───────────────────────────────────────────────────────────────

    @Test
    void pay_happy_path_transitions_pendiente_to_confirmada() {
        String email = "client@krypton.pe";
        User u = user(3L, email);
        Order o = order(3L, u, BigDecimal.TEN, OrderStatus.PENDIENTE);
        List<OrderItem> items = List.of();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(u));
        when(orderRepository.findByIdAndUser(3L, u)).thenReturn(Optional.of(o));
        when(orderRepository.save(o)).thenReturn(o);
        when(orderItemRepository.findByOrder(o)).thenReturn(items);
        when(orderMapper.toResponse(o, items)).thenReturn(
                new OrderResponse(3L, 3L, Instant.now(), "CONFIRMADA", BigDecimal.TEN, List.of()));

        OrderResponse result = service.pay(email, 3L, new PaymentRequest(PaymentMethod.YAPE));

        assertThat(result.status()).isEqualTo("CONFIRMADA");
        assertThat(o.getStatus()).isEqualTo(OrderStatus.CONFIRMADA);
        verify(orderRepository).save(o);
    }

    @Test
    void pay_already_confirmada_throws_OrderStatusTransitionException() {
        String email = "client@krypton.pe";
        User u = user(3L, email);
        Order o = order(4L, u, BigDecimal.TEN, OrderStatus.CONFIRMADA);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(u));
        when(orderRepository.findByIdAndUser(4L, u)).thenReturn(Optional.of(o));

        assertThatThrownBy(() -> service.pay(email, 4L, new PaymentRequest(PaymentMethod.YAPE)))
                .isInstanceOf(OrderStatusTransitionException.class);

        verify(orderRepository, never()).save(any());
    }

    @Test
    void pay_cancelada_throws_OrderStatusTransitionException() {
        String email = "client@krypton.pe";
        User u = user(3L, email);
        Order o = order(7L, u, BigDecimal.TEN, OrderStatus.CANCELADA);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(u));
        when(orderRepository.findByIdAndUser(7L, u)).thenReturn(Optional.of(o));

        assertThatThrownBy(() -> service.pay(email, 7L, new PaymentRequest(PaymentMethod.EFECTIVO)))
                .isInstanceOf(OrderStatusTransitionException.class);
    }

    @Test
    void pay_IDOR_throws_ResourceNotFoundException() {
        String email = "client@krypton.pe";
        User u = user(3L, email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(u));
        when(orderRepository.findByIdAndUser(8L, u)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.pay(email, 8L, new PaymentRequest(PaymentMethod.CREDIT_CARD)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── ADMIN GROUP ─────────────────────────────────────────────────────────────

    @Test
    void getAllOrders_returns_page_of_all_orders() {
        Pageable pageable = PageRequest.of(0, 10);
        User u = user(3L, "client@krypton.pe");
        Order o = order(1L, u, BigDecimal.TEN, OrderStatus.PENDIENTE);
        Page<Order> page = new PageImpl<>(List.of(o), pageable, 1);

        when(orderRepository.findAll(pageable)).thenReturn(page);
        when(orderItemRepository.findByOrder(o)).thenReturn(List.of());
        when(orderMapper.toResponse(eq(o), any())).thenReturn(sampleResponse());

        PageResponse<OrderResponse> result = service.getAllOrders(pageable);

        assertThat(result.content()).hasSize(1);
        assertThat(result.totalElements()).isEqualTo(1);
    }

    @Test
    void getOrder_returns_any_order_by_id() {
        User u = user(3L, "client@krypton.pe");
        Order o = order(10L, u, BigDecimal.TEN, OrderStatus.PENDIENTE);
        List<OrderItem> items = List.of();

        when(orderRepository.findById(10L)).thenReturn(Optional.of(o));
        when(orderItemRepository.findByOrder(o)).thenReturn(items);
        when(orderMapper.toResponse(o, items)).thenReturn(sampleResponse());

        OrderResponse result = service.getOrder(10L);

        assertThat(result).isNotNull();
    }

    @Test
    void getOrder_not_found_throws_ResourceNotFoundException() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getOrder(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateStatus_sets_arbitrary_status_with_no_guard() {
        User u = user(3L, "client@krypton.pe");
        Order o = order(2L, u, BigDecimal.TEN, OrderStatus.CONFIRMADA);
        List<OrderItem> items = List.of();

        when(orderRepository.findById(2L)).thenReturn(Optional.of(o));
        when(orderRepository.save(o)).thenReturn(o);
        when(orderItemRepository.findByOrder(o)).thenReturn(items);
        when(orderMapper.toResponse(o, items)).thenReturn(
                new OrderResponse(2L, 3L, Instant.now(), "CANCELADA", BigDecimal.TEN, List.of()));

        OrderResponse result = service.updateStatus(2L, OrderStatus.CANCELADA);

        assertThat(o.getStatus()).isEqualTo(OrderStatus.CANCELADA);
        verify(orderRepository).save(o);
        assertThat(result.status()).isEqualTo("CANCELADA");
    }
}
