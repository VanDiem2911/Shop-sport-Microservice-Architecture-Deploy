package iuh.fit.payment.controller;

import iuh.fit.payment.config.RabbitMQConfig;
import iuh.fit.payment.dto.PaymentRequest;
import iuh.fit.payment.dto.PaymentStatusEvent;
import iuh.fit.payment.entity.Payment;
import iuh.fit.payment.repository.PaymentRepository;
import iuh.fit.payment.service.MoMoService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final MoMoService momoService;
    private final RabbitTemplate rabbitTemplate;
    private final StringRedisTemplate redisTemplate;

    @PostMapping
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
        System.out.println("Processing payment for Order: " + request.getOrderId() + ", Method: " + request.getMethod());
        
        // Ngăn chặn thanh toán trùng lặp (lag mạng) bằng cách tạo khóa tạm trên Redis trong 30 giây
        String lockKey = "lock:payment:" + request.getOrderId();
        Boolean isLocked = redisTemplate.opsForValue().setIfAbsent(lockKey, "processing", Duration.ofSeconds(30));
        if (Boolean.FALSE.equals(isLocked)) {
            System.err.println("Duplicate payment request detected for order ID: " + request.getOrderId());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("status", "ERROR", "message", "Giao dịch thanh toán cho đơn hàng này đang được xử lý. Vui lòng không nhấn liên tục!"));
        }

        try {
            // Neu phuong thuc la MOMO, thuc hien ket noi momo sandbox
            if ("MOMO".equals(request.getMethod())) {
                // Luu lich su vao DB trang thai PENDING
                Payment payment = Payment.builder()
                        .orderId(request.getOrderId())
                        .amount(request.getAmount())
                        .paymentMethod(request.getMethod())
                        .username(request.getUsername())
                        .status("PENDING")
                        .transactionDate(LocalDateTime.now())
                        .build();
                paymentRepository.save(payment);

                Map<String, Object> momoResponse = momoService.createPaymentUrl(request.getOrderId(), request.getAmount());
                if (momoResponse != null && momoResponse.containsKey("payUrl")) {
                    String payUrl = (String) momoResponse.get("payUrl");
                    return ResponseEntity.ok().body(Map.of("status", "REDIRECT", "payUrl", payUrl));
                } else {
                    payment.setStatus("FAILED");
                    paymentRepository.save(payment);
                    redisTemplate.delete(lockKey); // Giải phóng khóa sớm vì tạo link MoMo thất bại
                    String msg = momoResponse != null ? String.valueOf(momoResponse.get("message")) : "Không thể tạo liên kết MoMo";
                    return ResponseEntity.status(500).body(Map.of("status", "ERROR", "message", msg));
                }
            }

            // Luu lich su vao DB trang thai PENDING cho COD hoac SUCCESS cho cac phuong thuc khac
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
                String targetStatus = "SUCCESS";
                if ("CASH_ON_DELIVERY".equals(request.getMethod())) {
                    targetStatus = "PENDING";
                }
                payment.setStatus(targetStatus);
                paymentRepository.save(payment);
                
                // Neu thanh toan thanh cong (khong phai COD), publish su kien sang OrderService
                if ("SUCCESS".equals(targetStatus)) {
                    publishPaymentStatus(request.getOrderId(), "SUCCESS");
                } else if ("PENDING".equals(targetStatus) && "CASH_ON_DELIVERY".equals(request.getMethod())) {
                    publishPaymentStatus(request.getOrderId(), "PENDING");
                }
                
                System.out.println("Order " + request.getOrderId() + " payment processed successfully");
                return ResponseEntity.ok().body("{\"status\": \"SUCCESS\", \"transactionId\": \"MOCK-" + System.currentTimeMillis() + "\"}");
            }
            
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            redisTemplate.delete(lockKey); // Giải phóng khóa sớm vì giao dịch thanh toán thất bại
            return ResponseEntity.badRequest().body("{\"status\": \"FAILED\"}");
        } catch (Exception e) {
            redisTemplate.delete(lockKey); // Giải phóng khóa nếu xảy ra ngoại lệ bất ngờ
            throw e;
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrderId(@PathVariable Long orderId) {
        System.out.println("Fetching payment details for Order ID: " + orderId);
        return paymentRepository.findTopByOrderIdOrderByIdDesc(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/momo-callback")
    public ResponseEntity<?> verifyMomoCallback(@RequestBody Map<String, Object> params) {
        System.out.println("Received MoMo Callback parameters: " + params);
        boolean isValid = momoService.verifySignature(params);
        if (!isValid) {
            System.err.println("MoMo callback signature verification failed!");
            return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", "Invalid signature"));
        }

        String momoOrderId = (String) params.get("orderId");
        if (momoOrderId == null) {
            return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", "Missing orderId"));
        }

        Long orderId;
        try {
            orderId = Long.parseLong(momoOrderId.split("-")[0]);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", "Invalid orderId format"));
        }

        String resultCodeStr = String.valueOf(params.get("resultCode"));
        boolean paymentSuccess = "0".equals(resultCodeStr) || "0.0".equals(resultCodeStr);

        Payment payment = paymentRepository.findTopByOrderIdOrderByIdDesc(orderId)
                .orElseGet(() -> Payment.builder()
                        .orderId(orderId)
                        .amount(Double.valueOf(String.valueOf(params.get("amount"))))
                        .paymentMethod("MOMO")
                        .username("MoMo Callback User")
                        .transactionDate(LocalDateTime.now())
                        .build());

        if (paymentSuccess) {
            payment.setStatus("SUCCESS");
            paymentRepository.save(payment);

            // Publish status event asynchronously
            publishPaymentStatus(orderId, "SUCCESS");

            return ResponseEntity.ok().body(Map.of("status", "SUCCESS", "message", "Payment processed successfully"));
        } else {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);

            // Publish status event asynchronously
            publishPaymentStatus(orderId, "FAILED");

            String message = (String) params.getOrDefault("message", "Payment failed");
            return ResponseEntity.ok().body(Map.of("status", "FAILED", "message", message));
        }
    }

    @PostMapping("/momo-ipn")
    public ResponseEntity<?> handleMomoIpn(@RequestBody Map<String, Object> params) {
        System.out.println("Received MoMo IPN: " + params);
        boolean isValid = momoService.verifySignature(params);
        if (!isValid) {
            System.err.println("MoMo IPN signature verification failed!");
            return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", "Invalid signature"));
        }

        String momoOrderId = (String) params.get("orderId");
        if (momoOrderId == null) {
            return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", "Missing orderId"));
        }

        Long orderId;
        try {
            orderId = Long.parseLong(momoOrderId.split("-")[0]);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", "Invalid orderId format"));
        }

        String resultCodeStr = String.valueOf(params.get("resultCode"));
        boolean paymentSuccess = "0".equals(resultCodeStr) || "0.0".equals(resultCodeStr);

        Payment payment = paymentRepository.findTopByOrderIdOrderByIdDesc(orderId)
                .orElseGet(() -> Payment.builder()
                        .orderId(orderId)
                        .amount(Double.valueOf(String.valueOf(params.get("amount"))))
                        .paymentMethod("MOMO")
                        .username("MoMo IPN User")
                        .transactionDate(LocalDateTime.now())
                        .build());

        if (paymentSuccess) {
            payment.setStatus("SUCCESS");
            paymentRepository.save(payment);

            // Publish status event asynchronously
            publishPaymentStatus(orderId, "SUCCESS");
        } else {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);

            // Publish status event asynchronously
            publishPaymentStatus(orderId, "FAILED");
        }

        return ResponseEntity.noContent().build();
    }

    private void publishPaymentStatus(Long orderId, String status) {
        try {
            PaymentStatusEvent event = PaymentStatusEvent.builder()
                    .orderId(orderId)
                    .status(status)
                    .build();
            rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE, RabbitMQConfig.PAYMENT_ROUTING_KEY, event);
            System.out.println("Published payment status event to RabbitMQ exchange " + RabbitMQConfig.PAYMENT_EXCHANGE + ": " + event);
        } catch (Exception e) {
            System.err.println("Failed to publish payment status event: " + e.getMessage());
        }
    }
}
