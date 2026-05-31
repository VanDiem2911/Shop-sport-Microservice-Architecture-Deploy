package iuh.fit.order.dto;

import lombok.*;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentStatusEvent implements Serializable {
    private Long orderId;
    private String status; // SUCCESS, FAILED, PENDING
}
