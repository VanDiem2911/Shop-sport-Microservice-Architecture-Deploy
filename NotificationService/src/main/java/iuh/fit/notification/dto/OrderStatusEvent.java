package iuh.fit.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusEvent implements Serializable {
    private Long orderId;
    private String status;
}
