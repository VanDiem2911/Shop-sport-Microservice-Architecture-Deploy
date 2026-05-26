package iuh.fit.payment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;
    private Double amount;
    private String paymentMethod;
    private String username;
    
    // Trang thai: PENDING, SUCCESS, FAILED
    private String status; 
    
    private LocalDateTime transactionDate;
}
