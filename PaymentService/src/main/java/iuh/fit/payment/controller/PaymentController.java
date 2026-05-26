package iuh.fit.payment.controller;

import iuh.fit.payment.dto.PaymentRequest;
import iuh.fit.payment.entity.Payment;
import iuh.fit.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepository paymentRepository;

    @Value("${order-service.url}")
    private String orderServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
        System.out.println("Processing payment for Order: " + request.getOrderId());
        
        // Luu lich su vao DB trang thai PENDING
        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .amount(request.getAmount())
                .paymentMethod(request.getMethod())
                .username(request.getUsername())
                .status("PENDING")
                .transactionDate(LocalDateTime.now())
                .build();
        payment = paymentRepository.save(payment);
        
        // Gia lap logic thanh toan (kiem tra han muc, tru tien tai khoan, v.v...)
        boolean paymentSuccess = true;
        
        if (paymentSuccess) {
            // Sửa lỗi tại đây: Nếu là COD thì trạng thái thanh toán ban đầu phải là PENDING
            if ("CASH_ON_DELIVERY".equals(request.getMethod())) {
                payment.setStatus("PENDING");
            } else {
                payment.setStatus("SUCCESS");
            }
            paymentRepository.save(payment);
            
            // Theo yêu cầu mới: Tất cả đơn hàng sau khi xác nhận thanh toán đều chuyển sang Đang chuẩn bị hàng
            String targetStatus = "PREPARING";

            try {
                String updateStatusUrl = orderServiceUrl + "/" + request.getOrderId() + "/status?status=" + targetStatus;
                restTemplate.put(updateStatusUrl, null);
                
                System.out.println("Order " + request.getOrderId() + " status updated to " + targetStatus);
                return ResponseEntity.ok().body("{\"status\": \"SUCCESS\", \"transactionId\": \"MOCK-" + System.currentTimeMillis() + "\"}");
            } catch (Exception e) {
                System.err.println("Failed to update order status: " + e.getMessage());
                return ResponseEntity.status(500).body("{\"status\": \"ERROR\", \"message\": \"Payment processed but failed to update order.\"}");
            }
        }
        
        payment.setStatus("FAILED");
        paymentRepository.save(payment);
        return ResponseEntity.badRequest().body("{\"status\": \"FAILED\"}");
    }

    // Endpoint mới để OrderService gọi sang khi đơn hàng được giao thành công
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateStatusByOrderId(@PathVariable Long orderId, @RequestParam String status) {
        return paymentRepository.findByOrderId(orderId)
                .map(payment -> {
                    payment.setStatus(status);
                    paymentRepository.save(payment);
                    System.out.println("Payment for Order " + orderId + " updated to " + status);
                    return ResponseEntity.ok().body("{\"message\": \"Payment status updated\"}");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
