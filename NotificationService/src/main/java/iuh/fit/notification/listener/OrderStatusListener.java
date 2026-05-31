package iuh.fit.notification.listener;

import iuh.fit.notification.config.RabbitMQConfig;
import iuh.fit.notification.dto.OrderStatusEvent;
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
public class OrderStatusListener {

    private final EmailService emailService;
    private final RestTemplate restTemplate;

    @Value("${services.order-service.url}")
    private String orderServiceUrl;

    @Value("${services.auth-service.url}")
    private String authServiceUrl;

    @RabbitListener(queues = RabbitMQConfig.ORDER_QUEUE)
    public void handleOrderStatusUpdate(OrderStatusEvent event) {
        System.out.println("NotificationService received order status update event: " + event);
        try {
            String status = event.getStatus();
            // GUI MAIL KHI:
            // 1. Don hang da duoc giao thanh cong (DELIVERED)
            if ("DELIVERED".equals(status)) {
                System.out.println("Processing order delivery notification email for Order ID: " + event.getOrderId());
                
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
                emailService.sendOrderDeliveredEmail(email, order);
            } else {
                System.out.println("Order status is " + status + ", no notification email needed.");
            }
        } catch (Exception e) {
            System.err.println("Error processing order status notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
