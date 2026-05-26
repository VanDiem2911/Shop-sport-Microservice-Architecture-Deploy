package iuh.fit.order.service;

import iuh.fit.order.entity.Order;
import iuh.fit.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import iuh.fit.order.dto.StockUpdateEvent;
import iuh.fit.order.config.RabbitMQConfig;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final RabbitTemplate rabbitTemplate;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${payment-service.url:http://localhost:8080/api/v1/payments}")
    private String paymentServiceUrl;

    @Value("${product-service.url:http://localhost:8080/api/v1/products}")
    private String productServiceUrl;

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

    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        order.setStatus(status);
        
        // Logic mới: Nếu đơn hàng được giao thành công, cập nhật trạng thái thanh toán thành SUCCESS
        if ("DELIVERED".equals(status)) {
            try {
                String updatePaymentUrl = paymentServiceUrl + "/" + orderId + "/status?status=SUCCESS";
                restTemplate.put(updatePaymentUrl, null);
                System.out.println("Payment for order " + orderId + " updated to SUCCESS via OrderService");
            } catch (Exception e) {
                System.err.println("Failed to update payment status for order " + orderId + ": " + e.getMessage());
            }
        }
        
        return orderRepository.save(order);
    }
}
