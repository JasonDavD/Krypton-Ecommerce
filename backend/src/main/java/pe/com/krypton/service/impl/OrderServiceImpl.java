package pe.com.krypton.service.impl;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
import pe.com.krypton.repository.CartItemRepository;
import pe.com.krypton.repository.CartRepository;
import pe.com.krypton.repository.OrderItemRepository;
import pe.com.krypton.repository.OrderRepository;
import pe.com.krypton.repository.ProductRepository;
import pe.com.krypton.repository.StockMovementRepository;
import pe.com.krypton.repository.UserRepository;
import pe.com.krypton.service.CartService;
import pe.com.krypton.service.OrderService;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final OrderMapper orderMapper;

    public OrderServiceImpl(OrderRepository orderRepository,
                            OrderItemRepository orderItemRepository,
                            ProductRepository productRepository,
                            StockMovementRepository stockMovementRepository,
                            CartRepository cartRepository,
                            CartItemRepository cartItemRepository,
                            UserRepository userRepository,
                            CartService cartService,
                            OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.cartService = cartService;
        this.orderMapper = orderMapper;
    }

    // ─── CLIENT: checkout ────────────────────────────────────────────────────────

    /**
     * Atomic checkout — single @Transactional boundary.
     * Two-pass validate-then-mutate (ADR-1):
     *   Pass A: PESSIMISTIC_WRITE lock on each product → validate stock → accumulate total.
     *   Pass B: save Order → per-item: save OrderItem (price snapshot), decrement stock,
     *           save StockMovement(SALIDA) → clearCart.
     */
    @Override
    @Transactional
    public OrderResponse checkout(String email) {
        User user = resolveUser(email);

        // Resolve cart — no cart or empty cart → 400
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new EmptyCartException("El carrito está vacío"));
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        if (cartItems.isEmpty()) {
            throw new EmptyCartException("El carrito está vacío");
        }

        // ── Pass A: validate all products + accumulate total ─────────────────────
        List<Product> lockedProducts = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem ci : cartItems) {
            Long productId = ci.getProduct().getId();
            Product product = productRepository.findByIdWithLock(productId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Producto no encontrado: " + productId));
            int requested = ci.getQuantity();
            if (requested > product.getStock()) {
                throw new InsufficientStockException(
                        "Stock insuficiente para el producto " + productId
                        + ": solicitado=" + requested + ", disponible=" + product.getStock());
            }
            lockedProducts.add(product);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(requested)));
        }

        // ── Pass B: persist Order then each line ─────────────────────────────────
        Order order = buildOrder(user, total);
        Order savedOrder = orderRepository.save(order);

        List<OrderItem> savedItems = new ArrayList<>();
        for (int i = 0; i < cartItems.size(); i++) {
            CartItem ci = cartItems.get(i);
            Product product = lockedProducts.get(i);
            int qty = ci.getQuantity();

            // OrderItem with unit_price snapshot
            OrderItem oi = new OrderItem();
            oi.setOrder(savedOrder);
            oi.setProduct(product);
            oi.setQuantity(qty);
            oi.setUnitPrice(product.getPrice()); // snapshot at checkout time
            savedItems.add(orderItemRepository.save(oi));

            // Decrement stock
            product.setStock(product.getStock() - qty);
            productRepository.save(product);

            // StockMovement (SALIDA)
            StockMovement movement = new StockMovement();
            movement.setProduct(product);
            movement.setType(MovementType.SALIDA);
            movement.setQuantity(qty);
            movement.setReason("Venta orden #" + savedOrder.getId());
            movement.setReference("ORDER-" + savedOrder.getId());
            movement.setCreatedAt(Instant.now());
            movement.setCreatedBy(null);
            stockMovementRepository.save(movement);
        }

        // Clear cart (joins this tx via PROPAGATION.REQUIRED)
        cartService.clearCart(email);

        return orderMapper.toResponse(savedOrder, savedItems);
    }

    // ─── CLIENT: read ────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(String email) {
        User user = resolveUser(email);
        List<Order> orders = orderRepository.findByUserOrderByOrderDateDesc(user);
        return orders.stream()
                .map(o -> orderMapper.toResponse(o, orderItemRepository.findByOrder(o)))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getMyOrder(String email, Long orderId) {
        User user = resolveUser(email);
        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Orden no encontrada: " + orderId));
        return orderMapper.toResponse(order, orderItemRepository.findByOrder(order));
    }

    // ─── CLIENT: pay ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public OrderResponse pay(String email, Long orderId, PaymentRequest request) {
        User user = resolveUser(email);
        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Orden no encontrada: " + orderId));
        if (order.getStatus() != OrderStatus.PENDIENTE) {
            throw new OrderStatusTransitionException(
                    "Solo se puede pagar una orden en estado PENDIENTE. Estado actual: "
                    + order.getStatus().name());
        }
        order.setStatus(OrderStatus.CONFIRMADA);
        orderRepository.save(order);
        return orderMapper.toResponse(order, orderItemRepository.findByOrder(order));
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrders(Pageable pageable) {
        Page<Order> page = orderRepository.findAll(pageable);
        Page<OrderResponse> responsePage = page.map(
                o -> orderMapper.toResponse(o, orderItemRepository.findByOrder(o)));
        return PageResponse.of(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Orden no encontrada: " + orderId));
        return orderMapper.toResponse(order, orderItemRepository.findByOrder(order));
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Orden no encontrada: " + orderId));
        order.setStatus(newStatus);
        orderRepository.save(order);
        return orderMapper.toResponse(order, orderItemRepository.findByOrder(order));
    }

    // ─── private helpers ─────────────────────────────────────────────────────────

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario no encontrado: " + email));
    }

    private Order buildOrder(User user, BigDecimal total) {
        Order o = new Order();
        o.setUser(user);
        o.setOrderDate(Instant.now());
        o.setStatus(OrderStatus.PENDIENTE);
        o.setTotal(total);
        return o;
    }
}
