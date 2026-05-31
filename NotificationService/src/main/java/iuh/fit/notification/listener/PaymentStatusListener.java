package iuh.fit.notification.listener;

import iuh.fit.notification.config.RabbitMQConfig;
import iuh.fit.notification.dto.PaymentStatusEvent;
import iuh.fit.notification.dto.OrderResponse;
import iuh.fit.notification.dto.UserResponse;
import iuh.fit.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class PaymentStatusListener {

    private final EmailService emailService;
    private final RestTemplate restTemplate;

    @Value("${services.order-service.url}")
    private String orderServiceUrl;

    @Value("${services.auth-service.url}")
    private String authServiceUrl;

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_QUEUE)
    public void handlePaymentStatusUpdate(PaymentStatusEvent event) {
        System.out.println("NotificationService received payment status update event: " + event);
        try {
            String status = event.getStatus();
            // GUI MAIL KHI:
            // 1. Giao dich thanh toan online thanh cong (SUCCESS)
            // 2. Don hang thanh toan COD duoc tao (PENDING)
            if ("SUCCESS".equals(status) || "PENDING".equals(status)) {
                System.out.println("Processing order placement email for Order ID: " + event.getOrderId());
                
                // 1. Lay chi tiet don hang
                String orderUrl = orderServiceUrl + "/" + event.getOrderId();
                OrderResponse order = restTemplate.getForObject(orderUrl, OrderResponse.class);
                if (order == null) {
                    System.err.println("Could not retrieve order details for ID: " + event.getOrderId());
                    return;
                }
                
                // 2. Lay email nguoi dung tu AuthService
                String username = order.getUsername();
                String email = null;
                if (username != null && !username.isEmpty()) {
                    try {
                        String encodedUsername = URLEncoder.encode(username, StandardCharsets.UTF_8.toString());
                        String authUrl = authServiceUrl + "/user/" + encodedUsername;
                        UserResponse user = restTemplate.getForObject(authUrl, UserResponse.class);
                        if (user != null) {
                            email = user.getEmail();
                        }
                    } catch (Exception authEx) {
                        System.err.println("Could not retrieve user info for username '" + username + "': " + authEx.getMessage());
                    }
                }
                
                // Fallback email neu khong tim thay
                if (email == null || email.isEmpty()) {
                    email = "customer@example.com";
                    System.out.println("Fallback to default email 'customer@example.com' for order #" + order.getId());
                }
                
                // 3. Gui email
                emailService.sendOrderPlacedEmail(email, order);
            } else {
                System.out.println("Payment status is " + status + ", no notification email needed.");
            }
        } catch (Exception e) {
            System.err.println("Error processing payment status notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
