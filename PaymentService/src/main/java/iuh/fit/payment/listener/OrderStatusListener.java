package iuh.fit.payment.listener;

import iuh.fit.payment.config.RabbitMQConfig;
import iuh.fit.payment.dto.OrderStatusEvent;
import iuh.fit.payment.entity.Payment;
import iuh.fit.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OrderStatusListener {

    private final PaymentRepository paymentRepository;

    @RabbitListener(queues = RabbitMQConfig.ORDER_QUEUE)
    public void handleOrderStatusUpdate(OrderStatusEvent event) {
        System.out.println("Received asynchronous order status event via RabbitMQ: " + event);
        if ("DELIVERED".equals(event.getStatus())) {
            try {
                Optional<Payment> paymentOpt = paymentRepository.findTopByOrderIdOrderByIdDesc(event.getOrderId());
                if (paymentOpt.isPresent()) {
                    Payment payment = paymentOpt.get();
                    payment.setStatus("SUCCESS");
                    paymentRepository.save(payment);
                    System.out.println("Payment for Order " + event.getOrderId() + " updated to SUCCESS asynchronously.");
                } else {
                    System.err.println("No payment transaction found for Order ID: " + event.getOrderId());
                }
            } catch (Exception e) {
                System.err.println("Failed to update payment status: " + e.getMessage());
            }
        }
    }
}
