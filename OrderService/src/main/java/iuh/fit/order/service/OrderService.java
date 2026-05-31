package iuh.fit.order.service;

import iuh.fit.order.entity.Order;
import iuh.fit.order.repository.OrderRepository;
import iuh.fit.order.dto.OrderStatusEvent;
import iuh.fit.order.config.RabbitMQPaymentConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import iuh.fit.order.dto.StockUpdateEvent;
import iuh.fit.order.config.RabbitMQConfig;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public Order createOrder(Order order) {
        if (order.getItems() != null) {
            order.getItems().forEach(item -> {
                item.setOrder(order);
                // Publish asynchronous stock update event via RabbitMQ
                try {
                    StockUpdateEvent event = new StockUpdateEvent(item.getProductId(), item.getQuantity());
                    rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, event);
                    System.out.println("Published stock update event to RabbitMQ for product: " + item.getProductId());
                } catch (Exception e) {
                    System.err.println("Failed to publish stock update event for product " + item.getProductId() + ": " + e.getMessage());
                }
            });
        }
        return orderRepository.save(order);
    }

    public List<Order> getMyOrders(String username) {
        if (username != null && !username.isEmpty()) {
            return orderRepository.findByUsername(username);
        }
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        order.setStatus(status);
        
        // Logic mới: Nếu đơn hàng được giao thành công, publish sự kiện cập nhật thanh toán thành SUCCESS qua RabbitMQ
        if ("DELIVERED".equals(status)) {
            try {
                OrderStatusEvent event = OrderStatusEvent.builder()
                        .orderId(orderId)
                        .status("DELIVERED")
                        .build();
                rabbitTemplate.convertAndSend(RabbitMQPaymentConfig.ORDER_EXCHANGE, RabbitMQPaymentConfig.ORDER_ROUTING_KEY, event);
                System.out.println("Published order status event to RabbitMQ exchange " + RabbitMQPaymentConfig.ORDER_EXCHANGE + ": " + event);
            } catch (Exception e) {
                System.err.println("Failed to publish order status event for order " + orderId + ": " + e.getMessage());
            }
        }
        
        return orderRepository.save(order);
    }
}
