package iuh.fit.order.listener;

import iuh.fit.order.config.RabbitMQPaymentConfig;
import iuh.fit.order.dto.PaymentStatusEvent;
import iuh.fit.order.entity.Order;
import iuh.fit.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class PaymentStatusListener {

    private final OrderRepository orderRepository;

    @RabbitListener(queues = RabbitMQPaymentConfig.PAYMENT_QUEUE)
    @Transactional
    public void handlePaymentStatusUpdate(PaymentStatusEvent event) {
        System.out.println("Received asynchronous payment status event via RabbitMQ: " + event);
        try {
            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found with id: " + event.getOrderId()));

            String targetStatus;
            if ("SUCCESS".equals(event.getStatus())) {
                targetStatus = "PREPARING";
            } else if ("FAILED".equals(event.getStatus())) {
                targetStatus = "CANCELLED";
            } else {
                System.out.println("Payment status is PENDING or other, no order status update needed.");
                return;
            }

            order.setStatus(targetStatus);
            orderRepository.save(order);
            System.out.println("Order " + event.getOrderId() + " status updated to " + targetStatus + " asynchronously.");
        } catch (Exception e) {
            System.err.println("Failed to process payment status update event: " + e.getMessage());
        }
    }
}
