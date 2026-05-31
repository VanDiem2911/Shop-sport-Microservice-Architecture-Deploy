package iuh.fit.payment.repository;

import iuh.fit.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
    Optional<Payment> findTopByOrderIdOrderByIdDesc(Long orderId);
}
