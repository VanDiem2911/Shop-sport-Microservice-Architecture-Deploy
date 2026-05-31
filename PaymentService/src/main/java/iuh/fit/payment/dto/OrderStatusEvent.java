package iuh.fit.payment.dto;

import lombok.*;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusEvent implements Serializable {
    private Long orderId;
    private String status; // DELIVERED, etc.
}
